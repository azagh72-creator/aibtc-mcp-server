;; whale-router-v1
;; Flying Whale Universal Swap Router — On-Chain Registry
;; COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
;; Flying Whale Proprietary License v2.0 — Agreement-First Policy
;; Owner: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
;; On-chain IP: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1
;; Enforcement: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-signal-registry-v1
;; Stack: Multi-Layer Sovereignty Stack v2.0.0 — Layer 5: Settlement (Router)
;;
;; On-chain registry of all WHALE swap routes via 2-hop Bitflow routing.
;; Leg 1: WHALE <-> wSTX via Bitflow XYK pool #42
;; Leg 2: wSTX <-> ANY via ALEX, Velar, or Bitflow wSTX pools
;; Result: WHALE exchangeable for 50+ tokens on the Stacks ecosystem.
;;
;; Deployed: block 7500763
;; TX: cb15fed7a26e325fa333d849a4c2080aa4b51e7fe79cf99f49506d04fd93022b
;;
;; ⚠️  CORRECTION (2026-04-07): The on-chain data below lists wrapped-stx-token as y-token.
;; The pool's ACTUAL registered y-token is SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.wstx
;; Always use SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.wstx for all swap calls.
;; Using wrapped-stx-token causes (err u2) — ERR_INVALID_Y_TOKEN at xyk-core-v-1-2.

(define-constant OWNER   'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW)
(define-constant FEE-BPS u55)

(define-read-only (get-routes)
  (ok {
    whale-to-wstx:  { status: "LIVE",    dex: "Bitflow",  pool: "xyk-pool-whale-wstx-v-1-3", leg: u1 },
    wstx-to-whale:  { status: "LIVE",    dex: "Bitflow",  pool: "xyk-pool-whale-wstx-v-1-3", leg: u1 },
    whale-to-stx:   { status: "LIVE",    dex: "Bitflow",  note: "leg-1 plus unwrap wSTX",     leg: u2 },
    whale-to-alex:  { status: "LIVE",    dex: "ALEX",     note: "leg-1 Bitflow leg-2 ALEX",   leg: u2 },
    whale-to-sbtc:  { status: "LIVE",    dex: "ALEX",     note: "leg-1 Bitflow leg-2 ALEX",   leg: u2 },
    whale-to-usdc:  { status: "LIVE",    dex: "ALEX",     note: "leg-1 Bitflow leg-2 ALEX",   leg: u2 },
    whale-to-ststx: { status: "LIVE",    dex: "Bitflow",  note: "leg-1 plus leg-2 Bitflow",   leg: u2 },
    whale-to-diko:  { status: "PENDING", dex: "ALEX",     note: "pending wSTX/DIKO pool",     leg: u2 },
    whale-to-welsh: { status: "PENDING", dex: "Velar",    note: "pending wSTX/WELSH pool",    leg: u2 }
  })
)

(define-read-only (get-pool-info)
  (ok {
    pool-contract: 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.xyk-pool-whale-wstx-v-1-3,
    core-contract: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-core-v-1-2,
    x-token:       'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3,
    y-token:       'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.wstx,
    fee-bps:       FEE-BPS,
    dex:           "Bitflow XYK",
    pair:          "WHALE/wSTX"
  })
)

(define-read-only (get-swap-instructions)
  (ok {
    step-1-contract: 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-core-v-1-2,
    step-1-function: "swap-x-for-y",
    step-1-pool:     'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.xyk-pool-whale-wstx-v-1-3,
    step-1-x-token:  'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3,
    step-1-y-token:  'SP2VCQJGH7PHP2DJK7Z0V48AGBHQAW3R3ZW1QF4N.wstx,
    step-2-note:     "Use any ALEX/Velar/Bitflow wSTX pool as leg-2",
    ui:              "https://app.bitflow.finance",
    pool-id:         u42
  })
)

(define-read-only (get-owner) (ok OWNER))
