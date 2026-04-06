;; whale-router-v1
;; Flying Whale Universal Swap Router
;; COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
;; Flying Whale Proprietary License v2.0
;; Owner: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
;;
;; Routes WHALE <-> wSTX through the Bitflow XYK pool as leg 1.
;; Any wSTX pool on ALEX, Velar, or Bitflow can then serve as leg 2,
;; making WHALE exchangeable for all 50+ tokens on the Stacks ecosystem.

;; =========================================================
;; CONSTANTS
;; =========================================================

(define-constant OWNER 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW)

;; Bitflow XYK pool: WHALE/wSTX
(define-constant BITFLOW-POOL 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.xyk-pool-whale-wstx-v-1-3)

;; Error codes
(define-constant ERR-ZERO (err u9001))   ;; amount must be greater than zero
(define-constant ERR-OWNER (err u9003))  ;; caller is not the contract owner

;; Pool fee in basis points (0.55% = 55 bps)
(define-constant FEE-BPS u55)

;; =========================================================
;; READ-ONLY: ROUTE DISCOVERY
;; =========================================================

;; Returns a human-readable map of available swap routes and their status.
;; LIVE   = pool deployed and active on mainnet.
;; PENDING = pool not yet deployed; route available once pool is live.
(define-read-only (get-routes)
  (ok {
    whale-to-wstx:  { status: "LIVE",    dex: "Bitflow", pool: "xyk-pool-whale-wstx-v-1-3" },
    wstx-to-whale:  { status: "LIVE",    dex: "Bitflow", pool: "xyk-pool-whale-wstx-v-1-3" },
    whale-to-stx:   { status: "LIVE",    dex: "Bitflow", note: "unwrap wSTX after leg-1"    },
    whale-to-alex:  { status: "LIVE",    dex: "ALEX",    note: "leg-1 this router, leg-2 ALEX wSTX/ALEX pool" },
    whale-to-sbtc:  { status: "LIVE",    dex: "ALEX",    note: "leg-1 this router, leg-2 ALEX wSTX/sBTC pool" },
    whale-to-usdc:  { status: "LIVE",    dex: "ALEX",    note: "leg-1 this router, leg-2 ALEX wSTX/aeUSDC pool" },
    whale-to-ststx: { status: "LIVE",    dex: "Bitflow", note: "leg-1 this router, leg-2 Bitflow wSTX/stSTX pool" },
    whale-to-diko:  { status: "PENDING", dex: "ALEX",    note: "pending wSTX/DIKO liquidity" },
    whale-to-welsh: { status: "PENDING", dex: "Velar",   note: "pending wSTX/WELSH liquidity" }
  })
)

;; =========================================================
;; READ-ONLY: POOL INFO
;; =========================================================

;; Returns metadata about the primary WHALE/wSTX pool used by this router.
(define-read-only (get-pool-info)
  (ok {
    pool:    BITFLOW-POOL,
    fee-bps: FEE-BPS,
    dex:     "Bitflow",
    pair:    "WHALE/wSTX",
    version: "v1-3"
  })
)

;; =========================================================
;; READ-ONLY: PRICE QUOTES
;; =========================================================

;; Quote: how many wSTX will you receive for selling `amount` WHALE?
;; Calls get-y-given-x on the Bitflow XYK pool (x = WHALE, y = wSTX).
;; Returns (ok uint) — expected wSTX output before slippage.
(define-read-only (quote-whale-to-wstx (amount uint))
  (if (> amount u0)
    (contract-call? BITFLOW-POOL get-y-given-x amount)
    ERR-ZERO)
)

(define-read-only (quote-wstx-to-whale (amount uint))
  (if (> amount u0)
    (contract-call? BITFLOW-POOL get-x-given-y amount)
    ERR-ZERO)
)

;; =========================================================
;; PUBLIC: SWAP FUNCTIONS
;; =========================================================

;; Swap WHALE -> wSTX via the Bitflow XYK pool.
;;
;; Parameters:
;;   amount   — exact WHALE amount to sell (micro-units, 6 decimals)
;;   min-out  — minimum wSTX to receive; transaction reverts if pool gives less
;;
;; The caller must have approved this contract to transfer `amount` WHALE
;; before calling (or pass tokens directly depending on pool SIP-010 model).
(define-public (swap-whale-to-wstx (amount uint) (min-out uint))
  (begin
    (asserts! (> amount u0) ERR-ZERO)
    (contract-call? BITFLOW-POOL swap-x-for-y amount min-out)
  )
)

;; Swap wSTX -> WHALE via the Bitflow XYK pool.
;;
;; Parameters:
;;   amount   — exact wSTX amount to sell (micro-units, 6 decimals)
;;   min-out  — minimum WHALE to receive; transaction reverts if pool gives less
(define-public (swap-wstx-to-whale (amount uint) (min-out uint))
  (begin
    (asserts! (> amount u0) ERR-ZERO)
    (contract-call? BITFLOW-POOL swap-y-for-x amount min-out)
  )
)

;; =========================================================
;; READ-ONLY: OWNERSHIP
;; =========================================================

(define-read-only (get-owner)
  (ok OWNER)
)

;; =========================================================
;; MULTI-HOP ROUTING (2-step):
;;
;; WHALE → wSTX : use swap-whale-to-wstx (this contract, Bitflow)
;; wSTX  → ANY  : use any ALEX / Velar / Bitflow wSTX pool as leg 2
;;
;; Example: WHALE → sBTC
;;   step 1 → swap-whale-to-wstx (whale-router-v1)
;;   step 2 → swap on ALEX wSTX/sBTC pool
;;
;; Example: WHALE → ALEX
;;   step 1 → swap-whale-to-wstx (whale-router-v1)
;;   step 2 → swap on ALEX wSTX/ALEX pool
;;
;; Result: WHALE is exchangeable for ALL 50+ tokens on Stacks ecosystem
;; via a 2-hop path with a single liquidity anchor (this pool).
;; =========================================================
