;; whale-gate-v1
;; Flying Whale Universal Access Gate
;; COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
;; Flying Whale Proprietary License v2.0 — Agreement-First Policy
;; Owner: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
;; On-chain IP: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1
;; Enforcement: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-signal-registry-v1
;; Stack: Multi-Layer Sovereignty Stack v2.0.0 — Layer 4: Execution Kernel (WHALE Gate)
;;
;; THE SOUL OF THE SYSTEM.
;; No WHALE = No access. No exceptions.
;;
;; Scout   100 WHALE  or score >= 50  → marketplace
;; Agent   1,000 WHALE or score >= 150 → marketplace + intelligence + API
;; Elite   10,000 WHALE or score >= 300 → all features
;; Council score >= 300                 → governance
;;
;; Deployed: block 7500768
;; TX: 3b12575b94b3920a118a4ccf1f71a94b978971d2370a75d37baf0a46bb09291e

(define-constant OWNER         'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW)
(define-constant SCOUT-MIN     u100000000)
(define-constant AGENT-MIN     u1000000000)
(define-constant ELITE-MIN     u10000000000)
(define-constant SCOUT-SCORE   u50)
(define-constant COUNCIL-SCORE u300)
(define-constant ERR-OWNER     (err u7003))

(define-data-var gate-active bool true)

(define-read-only (get-membership (who principal))
  (let (
    (bal   (unwrap-panic (contract-call? 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3 get-balance who)))
    (score (contract-call? 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-scoring-v1 get-cached-score who))
    (tier  (if (>= bal ELITE-MIN) "Elite"
             (if (>= bal AGENT-MIN) "Agent"
               (if (>= bal SCOUT-MIN) "Scout" "None"))))
    (access (or (>= bal SCOUT-MIN) (>= score SCOUT-SCORE)))
  )
  (ok {
    address:          who,
    whale-balance:    bal,
    reputation-score: score,
    tier:             tier,
    has-access:       access,
    features: {
      marketplace:   (>= bal SCOUT-MIN),
      intelligence:  (>= bal AGENT-MIN),
      governance:    (>= score COUNCIL-SCORE),
      execution-api: (>= bal AGENT-MIN),
      premium-data:  (>= bal ELITE-MIN),
      co-governance: (>= score COUNCIL-SCORE)
    },
    buy-whale: "https://app.bitflow.finance",
    message: (if access "Welcome to Flying Whale." "No WHALE detected. Buy at app.bitflow.finance.")
  }))
)

(define-read-only (check-access (who principal) (min-score uint))
  (let ((score (contract-call? 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-scoring-v1 get-cached-score who)))
    (if (>= score min-score) (ok true) (err u7001)))
)

(define-read-only (get-gate-info)
  (ok {
    gate:    "whale-gate-v1",
    version: "1.0",
    active:  (var-get gate-active),
    owner:   OWNER,
    tiers: {
      scout:   { whale-min: u100,   score-min: u50,  features: "marketplace" },
      agent:   { whale-min: u1000,  score-min: u150, features: "marketplace + intelligence + API" },
      elite:   { whale-min: u10000, score-min: u300, features: "all features + premium data" },
      council: { whale-min: u10000, score-min: u300, features: "governance + co-creation" }
    },
    economy: { burns-per-action: u1, total-supply: u12616800, deflationary: true }
  })
)

(define-read-only (get-owner) (ok OWNER))

(define-public (set-gate-active (active bool))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR-OWNER)
    (var-set gate-active active)
    (ok active))
)
