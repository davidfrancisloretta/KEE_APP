# Observability Authority

## Logging

### Levels
- `error`: Unhandled exceptions, failed transactions, auth failures
- `warn`: Deprecated usage, approaching limits, retry attempts
- `info`: Request lifecycle, user actions (lesson start/complete, quiz submit)
- `debug`: Query results, cache hits/misses (dev only)

### Structured Logging
```json
{
  "level": "info",
  "message": "lesson_completed",
  "userId": "uuid",
  "lessonId": "uuid",
  "ageGroup": "junior-scholars",
  "duration_ms": 1250,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Rules
- Never log passwords, tokens, or PII
- Log user IDs, not usernames/emails
- Include correlation IDs for request tracing
- Log at function boundaries, not inside loops

## Error Tracking

- Unhandled errors: catch at boundary, log + report
- tRPC errors: logged server-side with input context
- Client errors: Error boundaries per route group
- Content parsing errors: logged with file name + line context

## Metrics to Track

### Application
- Active users (DAU/WAU/MAU) by age group
- Lessons completed per day
- Quiz pass rate by age group
- Average session duration
- Content parse success rate

### Technical
- API response times (p50, p95, p99)
- Database query duration
- Redis hit/miss ratio
- Error rate by endpoint
- Core Web Vitals

## Health Checks

- `/api/health` — app is running
- Database connectivity
- Redis connectivity
- Auth service status

## Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error rate | >1% | >5% |
| API p95 latency | >500ms | >2000ms |
| DB connection pool | >70% | >90% |
| Disk usage | >70% | >90% |
