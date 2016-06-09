- Feature Name: Per-Node, In Memory Statistics
- Status: draft
- Start Date: 
- Authors: Matt Tracy
- RFC PR: (PR # after acceptance of initial draft)
- Cockroach Issue: (one or more # from the issue tracker)

# Summary

This RFC has three main goals:

1. Begin storing current metric measurements on each node using a highly
   dimensioned in-memory store. This will provide a much richer set of data than
   our current status component, which only maintains dimensionless measurements
   for storage in our time series database.
2. Expose an interface to query current metric measurements store on a running
   node. This will be available externally (to admins and to third party
   systems), but will also be used internally (for example, to record a subset
   of measurements to our time series database).
3. Provide general guidance on when metrics should be created and how they
   should be dimensioned.

# Motivation

Motivation for this change was borne from two separate problems:

1. A desire to begin recording more complicated distributed metrics in
   cockroach's built-in time series database; for example, per table statistics.
2. The desire to expose our metric measurements to third party monitoring
   systems (for example, we have a near-term goal of supporting Prometheus).

### Distributed Metrics

Distributed metrics are currently never measured directly; instead, a *time
series* of a distributed metric is derived by aggregating the time series of
several local metrics. For example, take the simple distributed metric such as
"total insert operations across the cluster". CockroachDB does not measure this
directly; however, each CockroachDB node does measure the *local* count of
Insert operations, and each node records a time series based on this
measurement. By *aggregating* the data points of the time series recorded by all
of the nodes, a time series is computed which approximates the desired
distributed metric.

However, as metrics get more specific and complex, this model begins to break
down. For example, consider a time series "total size of table X". The data for
table X is distributed across the cluster, so this is necessarily a distributed
metric. Additionally, the definition of "size" is ambiguous; do we want the
total disk size used (including all replicas), or do we want the number of
*unique* bytes belonging to this table? In the former case (total disk size of
all replicas), each node must record a time series "local size of table X". In
the latter case, each node must record a time series for *each replica* it
contains which is part of table X; something like "local size of range N of table X".

In either case, the number of time series we are recording expands dramatically;
the number is in one case unbounded in two dimensions (tables and nodes), while
the other leaves us recording at least one time series for *every replica*.
Unlike coarse-grained local time series that currently exist, these new time
series are not particularly interesting on their own; they exist only to compute
the distributed metric.

While recording more detailed local data is always nice, we are bound by
performance obligations to reduce this overhead when possible. Thus, we look for
a way to compute valuable distributed metrics *without* the overhead of
recording extremely specific local time series of limited value.

### Third-Party Monitoring

CockroachDB currrently maintains a few different instrumentation systems:
plaintext process logs, a tracing system, and the time series database. 

Process logs can already be consumed by third-party log aggregators; they are
simply files written to a known location in the local file system. The tracing
system is implemented using the "opentracing" library, which theoretically will
allow us to write traces to any third-party trace store that implements an
opentracing component (although it currently requires CockroachDB to be
recompiled). The time series database (along with the metrics it measures) is
the least accessible of these instrumentation systems; this data can only be
queried as time series through proprietary HTTP interface.

While this is adequate for our internal graphs, external monitoring solutions
will likely want to record this data in a separate, specialized time series
database (alongside time series from other applications). To support these,
each CockroachDB node must provide better access to its current metric
measurements; it would also be highly beneficial to expose more *dimensions* to
these measurements (i.e. breaking down metrics by user or table); our
internal time series database has limited bandwidth compared to specialized
solutions, but we need to expose more detailed data to these systems in order to
get a benefit.

Additionally, our current selection of metrics is essentially ad-hoc; there have
been a few small efforts to instrument certain parts of our system, but the
metrics we monitor are not documented and are only discoverable by reading
through the codebase. To support third-party monitoring we must be able to
document the metrics CockroachDB maintains; more than that, we should make an
effort to ensure that the metrics being recorded represent the full state of the
system.

### Common Need: In-Memory Metric Store

A tool which would assist both of these goals is a more advanced in-memory
metric store; as an alternative to our current time-series focused system, this
would be a highly-dimensioned store of measurements intended for query by other
systems. It would be consumable by third-party components, but would also be
consumed by our internal systems in order to compute the value of distributed
metrics.

# Detailed design

## In-Memory Metric Store

### Storage mechanism

Concerns:
+ Highly Dimensioned
+ Efficient Performance
+ Counters, Gauges, Histograms and Moving Averages
+ Contains Documentation
+ Not Global

### Query Interface

Concerns:
+ Directly query measurements for a metric
+ Query multiple metrics at once
+ Query documentation for a metric
+ Query Histogram by percentile

Out Of Scope:
+ Differentials
+ Advanced Histogram queries (e.g. Bucket sizes)

## Guidance for Metric Creation

### What Metrics should be recorded

OPERATIONS:
+ Any incoming request over a network (HTTP or RPC)
+ Any outgoing RPC request
+ Any action placed onto a queue
+ Any action pulled off of a queue

ALGORITHM SPECIFICS:
+ Errors (e.g. bad request, transaction conlicts)
+ Happy paths (e.g Cache miss vs. hit)
+ Degredations (e.g. table scans)
+ Amortized work (e.g. Garbage collections, compactions)

RESOURCES:
+ Disk
+ Memory
+ CPU
+ Bandwidth
+ Metrics which could be composed from differential stats (i.e. writes minus
    deletes), but are more easily captured as a resource.

### What data should be recorded at these points

OPERATIONS:
+ Counts
+ Payload Size
+ Latency (time to finish)

ALGORITHM SPECIFICS:
+ Counts
+ Work Saved for happy paths (If possible)
+ Service time (For degradations and amortized work)

RESOURCES:
+ Gauges

### How Metrics should be dimensioned

+ Caller (i.e. User)
+ Target (i.e. Range, Table)
+ Operation Type (if multiple operations come from the same source)
+ Error Type (for error responses)

Dimensions are NOT necessarily cartesian

# Drawbacks

+ Requires more memory
+ Performance is "global" state, locking might degrade asynchronous performance
+ Computing distributed statistics will need to be done by somebody (i.e. the
    first range of a table); requires job management of some kind.

# Alternatives

+ Use "Status Summary" system for external queries (a query of all current metrics)
+ Use current metrics system, augmented with "whitelists" to prevent persisting
    too many time series
+ Go ahead and persist large number of time series, maybe it's not a problem

# Unresolved questions
