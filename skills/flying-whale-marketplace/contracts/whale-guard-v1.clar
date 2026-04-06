;; whale-guard-v1
;; Flying Whale On-Chain Rate Limiter — MCP Overthinking Attack Defense
;; COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
;; Flying Whale Proprietary License v2.0
;; Owner: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
;;
;; Defends against MCPTox-class Denial-of-Wallet attacks:
;; Malicious MCP tool servers that induce 142x token amplification via cyclic loops,
;; draining x402 API budgets and forcing repeated on-chain transactions.
;;
;; Integration: any execution endpoint calls (check-and-record caller) before processing.
;; Returns (err u9001) if rate limit exceeded — caller must abort execution.
;;
;; Window: 10 blocks (~100 minutes on Stacks)
;; Default limit: 20 calls per principal per window
;;
;; Deployed: block TBD

(define-constant OWNER           'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW)
(define-constant WINDOW-BLOCKS   u10)
(define-constant ERR-RATE-LIMIT  (err u9001))
(define-constant ERR-OWNER       (err u9002))

(define-data-var max-calls-per-window uint u20)

(define-map call-tracker
  { caller: principal }
  { count: uint, window-start: uint }
)

;; Check caller against rate limit and record call.
;; Returns (ok calls-this-window) or (err u9001) if limited.
;; Integrate as: (try! (contract-call? .whale-guard-v1 check-and-record tx-sender))
(define-public (check-and-record (caller principal))
  (let (
    (limit    (var-get max-calls-per-window))
    (entry    (default-to { count: u0, window-start: block-height }
                          (map-get? call-tracker { caller: caller })))
    (w-start  (get window-start entry))
    (w-count  (get count entry))
    (elapsed  (- block-height w-start))
    (in-win   (< elapsed WINDOW-BLOCKS))
    (cur-cnt  (if in-win w-count u0))
    (new-win  (if in-win w-start block-height))
  )
    (asserts! (< cur-cnt limit) ERR-RATE-LIMIT)
    (map-set call-tracker { caller: caller }
      { count: (+ cur-cnt u1), window-start: new-win })
    (ok cur-cnt))
)

;; Read-only status check (no state change)
(define-read-only (get-call-status (caller principal))
  (let (
    (entry    (default-to { count: u0, window-start: block-height }
                          (map-get? call-tracker { caller: caller })))
    (w-start  (get window-start entry))
    (w-count  (get count entry))
    (elapsed  (- block-height w-start))
    (in-win   (< elapsed WINDOW-BLOCKS))
    (cur-cnt  (if in-win w-count u0))
  )
  (ok {
    caller:        caller,
    calls-in-window: cur-cnt,
    max-allowed:   (var-get max-calls-per-window),
    window-blocks: WINDOW-BLOCKS,
    blocks-elapsed: elapsed,
    rate-limited:  (>= cur-cnt (var-get max-calls-per-window))
  }))
)

;; Owner: adjust limit (e.g. tighten to 10 for high-value ops)
(define-public (set-max-calls (new-max uint))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR-OWNER)
    (var-set max-calls-per-window new-max)
    (ok new-max))
)

;; Owner: reset a specific caller (e.g. after false-positive)
(define-public (reset-caller (caller principal))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR-OWNER)
    (map-delete call-tracker { caller: caller })
    (ok true))
)

(define-read-only (get-max-calls)  (ok (var-get max-calls-per-window)))
(define-read-only (get-owner)      (ok OWNER))
