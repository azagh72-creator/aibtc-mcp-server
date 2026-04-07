;; whale-signal-registry-v1
;; Flying Whale On-Chain Signal Audit Registry
;; COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
;; Flying Whale Proprietary License v2.0 — Agreement-First Policy
;; Owner: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
;; On-chain IP: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1
;; Stack: Multi-Layer Sovereignty Stack v2.0.0 — Layer 8: Audit Trail
;;
;; THE AUDIT LAYER.
;; Every signal filed on aibtc.news is recorded here with expected payout.
;; Every inclusion and payment update is recorded here.
;; Discrepancy between expected and actual is provable on Stacks — permanently.
;;
;; Status codes:
;;   u0 = filed       (submitted to aibtc.news, awaiting result)
;;   u1 = included    (brief_included or lead_included)
;;   u2 = paid        (payout_txid confirmed)
;;   u3 = disputed    (included but payout_txid null beyond expected window)
;;   u4 = void        (recompile-void or system error — earnings zeroed by platform)

(define-constant OWNER         'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW)
(define-constant ERR-OWNER     (err u8001))
(define-constant ERR-NOT-FOUND (err u8002))
(define-constant ERR-EXISTS    (err u8003))

(define-map signals
  { signal-id: (string-ascii 64) }
  {
    beat:           (string-ascii 32),
    filed-block:    uint,
    expected-sats:  uint,
    status:         uint,
    payout-txid:    (optional (string-ascii 64)),
    inclusion-type: (optional (string-ascii 32))
  }
)

(define-data-var signal-count uint u0)

;; Register a new signal at filing time
(define-public (register-signal
    (signal-id    (string-ascii 64))
    (beat         (string-ascii 32))
    (expected-sats uint))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR-OWNER)
    (asserts! (is-none (map-get? signals { signal-id: signal-id })) ERR-EXISTS)
    (map-set signals { signal-id: signal-id }
      {
        beat:           beat,
        filed-block:    block-height,
        expected-sats:  expected-sats,
        status:         u0,
        payout-txid:    none,
        inclusion-type: none
      })
    (var-set signal-count (+ (var-get signal-count) u1))
    (ok signal-id))
)

;; Update signal after inclusion or payment confirmation
(define-public (update-signal
    (signal-id      (string-ascii 64))
    (status         uint)
    (payout-txid    (optional (string-ascii 64)))
    (inclusion-type (optional (string-ascii 32))))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR-OWNER)
    (match (map-get? signals { signal-id: signal-id })
      entry
        (begin
          (map-set signals { signal-id: signal-id }
            (merge entry {
              status:         status,
              payout-txid:    payout-txid,
              inclusion-type: inclusion-type
            }))
          (ok signal-id))
      ERR-NOT-FOUND))
)

(define-read-only (get-signal (signal-id (string-ascii 64)))
  (ok (map-get? signals { signal-id: signal-id }))
)

(define-read-only (get-signal-count) (ok (var-get signal-count)))

(define-read-only (get-owner) (ok OWNER))
