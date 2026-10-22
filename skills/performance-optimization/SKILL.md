---
name: performance-optimization
description: "Measure-first optimisation: profilers per stack, common bottlenecks, caching, web budgets. Use when something is slow."
---

# Performance optimisation

## Workflow
1. **Target**: metric + percentile + goal (e.g. "p95 of GET /search < 300 ms at 200 rps").
2. **Baseline**: reproducible measurement under realistic data volume.
3. **Profile**: find where time/memory actually goes.
4. **Fix the top bottleneck only**, re-measure, keep or revert.
5. **Protect**: add a benchmark/budget/alert.

## Profiling tools
| Stack | CPU / time | Memory | Load |
|---|---|---|---|
| .NET | dotnet-trace, dotnet-counters, BenchmarkDotNet, PerfView | dotnet-gcdump, dotnet-dump | k6, NBomber |
| JVM | async-profiler, JFR, JMH | heap dump + Eclipse MAT | Gatling, k6 |
| Node | `--cpu-prof`, clinic.js, 0x | `--heap-prof`, heap snapshots | autocannon, k6 |
| Python | py-spy, cProfile, scalene | tracemalloc, memray | Locust |
| Go | pprof, `go test -bench` | pprof heap | vegeta, k6 |
| Browser | DevTools Performance, Lighthouse, WebPageTest | DevTools Memory | - |
| DB | `EXPLAIN (ANALYZE, BUFFERS)`, Query Store, `pg_stat_statements`, slow query log | - | pgbench |

## Usual suspects (check in this order)
1. **Database**: N+1 queries, missing/unused indexes, over-fetching, no pagination, lock contention, chatty transactions.
2. **Network/I/O**: serial calls that can be parallel, no connection pooling/HTTP keep-alive, missing timeouts, large payloads (compress, paginate, select fields).
3. **Algorithms**: nested loops over large collections (use dictionaries/sets), repeated work in loops, regex compilation in loops.
4. **Allocation**: string concatenation in loops, boxing, LINQ/streams in hot paths, large object heap, unbounded caches.
5. **Concurrency**: sync-over-async, thread-pool starvation, global locks.
6. **Frontend**: bundle size (code-split, tree-shake), render-blocking resources, unoptimised images (AVIF/WebP, sizes, lazy-load), layout shifts, excessive re-renders, long tasks blocking INP.

## Caching
- Cache only after the underlying query is reasonable.
- Decide: what key, TTL, invalidation trigger, stampede protection, max size, per-user vs shared.
- Layers: HTTP caching (`Cache-Control`, ETag) -> CDN -> app cache (in-memory / Redis) -> DB.

## Web budgets (Core Web Vitals "good")
LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1, initial JS ideally < 200 KB compressed.

## Report
Before/after numbers with the same method, the change, and its trade-offs.
