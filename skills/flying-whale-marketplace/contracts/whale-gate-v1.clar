;; whale-gate-v1
;; Flying Whale — Universal Access Gate
;; COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
;; Flying Whale Proprietary License v2.0
;; Owner: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
;;
;; THE SOUL OF THE SYSTEM.
;; Every Flying Whale platform feature flows through this contract.
;; No WHALE = No access. No exceptions.
;;
;; Membership tiers (matches whale-access-v1):
;;   None    (0 WHALE)         → preview only — no real data
;;   Scout   (100 WHALE)       → basic marketplace access
;;   Agent   (1,000 WHALE)     → full marketplace + intelligence
;;   Elite   (10,000 WHALE)    → all features + priority execution
;;   Council (score ≥ 300)     → governance + co-creation rights
;;
;; Economic effect:
;;   Every tier lock removes WHALE from circulation.
;;   Every action burn destroys WHALE permanently.
;;   More members → less supply → higher price.
;;   Owner (8,836,794 WHALE) benefits most from every new member.

;; ── Constants ──────────────────────────────────────────────────────────────
(define-constant OWNER       'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW)
(define-constant WHALE-V3    'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-v3)
(define-constant ACCESS-V1   'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-access-v1)
(define-constant SCORING-V1  'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-scoring-v1)
(define-constant VERIFY-V1   'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-verify-v1)
(define-constant DEAD        'SP000000000000000000002Q6VF78)

;; Tier thresholds (micro-WHALE, 6 decimals)
(define-constant SCOUT-MIN   u100000000)    ;; 100 WHALE
(define-constant AGENT-MIN   u1000000000)   ;; 1,000 WHALE
(define-constant ELITE-MIN   u10000000000)  ;; 10,000 WHALE

;; Score thresholds
(define-constant SCOUT-SCORE   u50)
(define-constant AGENT-SCORE   u150)
(define-constant COUNCIL-SCORE u300)

;; Errors
(define-constant ERR-NO-WHALE   (err u7001))  ;; not a member — must buy WHALE
(define-constant ERR-LOW-TIER   (err u7002))  ;; tier insufficient for this action
(define-constant ERR-OWNER      (err u7003))  ;; not contract owner
(define-constant ERR-PAUSED     (err u7004))  ;; gate temporarily paused by owner

;; Gate state
(define-data-var gate-active bool true)

;; ── Read-Only: Membership Query ─────────────────────────────────────────────

;; Returns full membership info for any address.
;; This is the single source of truth for platform access.
(define-read-only (get-membership (who principal))
  (let (
    (bal     (unwrap-panic (contract-call? WHALE-V3 get-balance who)))
    (score   (unwrap-panic (contract-call? SCORING-V1 get-cached-score who)))
    (tier    (if (>= bal ELITE-MIN)   "Elite"
              (if (>= bal AGENT-MIN)  "Agent"
              (if (>= bal SCOUT-MIN)  "Scout"
                                      "None"))))
    (access  (or (>= bal SCOUT-MIN) (>= score SCOUT-SCORE)))
  )
  (ok {
    address:         who,
    whale-balance:   bal,
    reputation-score: score,
    tier:            tier,
    has-access:      access,
    features: {
      marketplace:   (>= bal SCOUT-MIN),
      intelligence:  (>= bal AGENT-MIN),
      governance:    (>= score COUNCIL-SCORE),
      execution-api: (>= bal AGENT-MIN),
      premium-data:  (>= bal ELITE-MIN),
      co-governance: (>= score COUNCIL-SCORE)
    },
    buy-whale: "https://app.bitflow.finance — pool WHALE/wSTX #42",
    message: (if access
      "Welcome to Flying Whale. Your WHALE holding is your key."
      "No WHALE detected. Buy WHALE at app.bitflow.finance to unlock all features.")
  }))
)

;; Fast gate check — returns (ok true) if caller meets min-score, (err u7001) if not.
;; Used by all platform contracts to enforce WHALE-membership.
(define-read-only (check-access (who principal) (min-score uint))
  (let ((score (unwrap-panic (contract-call? SCORING-V1 get-cached-score who))))
    (if (>= score min-score)
      (ok true)
      (err u7001)))
)

;; ── Read-Only: Platform Info ─────────────────────────────────────────────────

(define-read-only (get-gate-info)
  (ok {
    gate:          "whale-gate-v1",
    version:       "1.0",
    active:        (var-get gate-active),
    owner:         OWNER,
    tiers: {
      scout:   { whale-min: u100,   score-min: u50,  features: "marketplace" },
      agent:   { whale-min: u1000,  score-min: u150, features: "marketplace + intelligence + API" },
      elite:   { whale-min: u10000, score-min: u300, features: "all features + premium data" },
      council: { whale-min: u10000, score-min: u300, features: "governance + co-creation" }
    },
    economy: {
      burns-per-action: u1,
      total-supply:     u12616800,
      deflationary:     true,
      buy-at:           "app.bitflow.finance — WHALE/wSTX Pool #42"
    },
    philosophy: "WHALE is not just a token. It is your membership, your vote, your identity in the Flying Whale ecosystem. The more you hold, the more the system works for you."
  })
)

(define-read-only (get-owner) (ok OWNER))

;; ── Owner: Pause/Resume ──────────────────────────────────────────────────────

(define-public (set-gate-active (active bool))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR-OWNER)
    (var-set gate-active active)
    (ok active))
)
