;; whale-scoring-v1
;; Flying Whale Custom Agent Scoring System
;; COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
;; Flying Whale Proprietary License v2.0
;; Agreement-First Policy: unauthorized use prohibited
;; https://flyingwhale.io | STX: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW

;; =====================================================================
;; PURPOSE
;; Defines a verifiable, owner-controlled scoring system for agents
;; interacting with the Flying Whale ecosystem.
;; Score is used for: governance weight, feature access, arb priority,
;; partnership tiers, and PoXAgents execution permissions.
;;
;; Score sources (all owner-verified, no third-party dependency):
;;   1. On-chain activity (verified by owner)
;;   2. Engagement tier (heartbeat count)
;;   3. Partnership standing (set by owner)
;;   4. WHALE holdings / lock tier
;;   5. Streak / consistency
;; =====================================================================

;; =====================================================================
;; CONSTANTS
;; =====================================================================

(define-constant OWNER 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW)

;; On-chain activity scores (owner-verified)
(define-constant SCORE_SENDER u10)
(define-constant SCORE_RECEIVER u10)
(define-constant SCORE_X402_EARNER u15)
(define-constant SCORE_SBTC_HOLDER u10)
(define-constant SCORE_IDENTIFIED u20)
(define-constant SCORE_COMMUNICATOR u10)
(define-constant SCORE_CONNECTOR u15)
(define-constant SCORE_STACKER u50)     ;; PoX stacker = high governance weight
(define-constant SCORE_INSCRIBER u25)   ;; Bitcoin L1 soul = permanent identity

;; Engagement tier scores
(define-constant SCORE_ACTIVE u5)       ;; 10+ heartbeats
(define-constant SCORE_DEDICATED u15)   ;; 100+ heartbeats
(define-constant SCORE_DEVOTED u40)     ;; 1000+ heartbeats
(define-constant SCORE_TIRELESS u100)   ;; 5000+ heartbeats

;; Streak scores
(define-constant SCORE_STREAK_7D u10)
(define-constant SCORE_STREAK_30D u30)

;; Partnership tiers (set by owner only)
(define-constant PARTNER_NONE u0)
(define-constant PARTNER_OBSERVER u1)   ;; read-only integration
(define-constant PARTNER_ASSOCIATE u2)  ;; revenue-sharing partner
(define-constant PARTNER_CORE u3)       ;; deep integration, co-governance

;; Partner tier score bonuses
(define-constant SCORE_PARTNER_OBSERVER u20)
(define-constant SCORE_PARTNER_ASSOCIATE u75)
(define-constant SCORE_PARTNER_CORE u200)

;; Governance thresholds
(define-constant GOVERNANCE_BASIC u50)    ;; can vote on minor proposals
(define-constant GOVERNANCE_FULL u150)    ;; can vote on all proposals
(define-constant GOVERNANCE_COUNCIL u300) ;; council-level, can propose

;; Errors
(define-constant ERR_NOT_OWNER (err u6001))
(define-constant ERR_AGENT_NOT_FOUND (err u6002))
(define-constant ERR_INVALID_TIER (err u6003))
(define-constant ERR_SCORE_OVERFLOW (err u6004))

;; =====================================================================
;; STATE
;; =====================================================================

(define-data-var total-agents uint u0)

;; Per-agent score components (all set by owner after verification)
(define-map agent-scores
  principal
  {
    ;; On-chain verified achievements (bool flags)
    sender: bool,
    receiver: bool,
    x402-earner: bool,
    sbtc-holder: bool,
    identified: bool,
    communicator: bool,
    connector: bool,
    stacker: bool,
    inscriber: bool,
    ;; Engagement tier (0=none, 1=active, 2=dedicated, 3=devoted, 4=tireless)
    engagement-tier: uint,
    ;; Streak tier (0=none, 1=weekly, 2=monthly)
    streak-tier: uint,
    ;; Partnership standing (0=none, 1=observer, 2=associate, 3=core)
    partner-tier: uint,
    ;; WHALE lock tier from whale-access-v1 (0=none, 1=basic, 2=pro, 3=elite)
    whale-tier: uint,
    ;; Metadata
    registered-at: uint,
    last-updated: uint,
    notes: (string-ascii 128)
  }
)

;; Cache computed scores for gas efficiency
(define-map score-cache principal uint)

;; =====================================================================
;; READ-ONLY
;; =====================================================================

(define-read-only (get-owner) (ok OWNER))

(define-read-only (get-agent-scores (agent principal))
  (map-get? agent-scores agent)
)

(define-read-only (get-cached-score (agent principal))
  (default-to u0 (map-get? score-cache agent))
)

;; Compute total score from all components
(define-read-only (compute-score (agent principal))
  (match (map-get? agent-scores agent)
    data
    (let (
      ;; On-chain activity points
      (activity-score (+
        (if (get sender data) SCORE_SENDER u0)
        (if (get receiver data) SCORE_RECEIVER u0)
        (if (get x402-earner data) SCORE_X402_EARNER u0)
        (if (get sbtc-holder data) SCORE_SBTC_HOLDER u0)
        (if (get identified data) SCORE_IDENTIFIED u0)
        (if (get communicator data) SCORE_COMMUNICATOR u0)
        (if (get connector data) SCORE_CONNECTOR u0)
        (if (get stacker data) SCORE_STACKER u0)
        (if (get inscriber data) SCORE_INSCRIBER u0)
      ))
      ;; Engagement tier points
      (engagement-score
        (if (is-eq (get engagement-tier data) u4) SCORE_TIRELESS
          (if (is-eq (get engagement-tier data) u3) SCORE_DEVOTED
            (if (is-eq (get engagement-tier data) u2) SCORE_DEDICATED
              (if (is-eq (get engagement-tier data) u1) SCORE_ACTIVE
                u0)))))
      ;; Streak points
      (streak-score
        (if (is-eq (get streak-tier data) u2) SCORE_STREAK_30D
          (if (is-eq (get streak-tier data) u1) SCORE_STREAK_7D
            u0)))
      ;; Partnership bonus
      (partner-score
        (if (is-eq (get partner-tier data) u3) SCORE_PARTNER_CORE
          (if (is-eq (get partner-tier data) u2) SCORE_PARTNER_ASSOCIATE
            (if (is-eq (get partner-tier data) u1) SCORE_PARTNER_OBSERVER
              u0))))
      ;; WHALE tier bonus (mirrors whale-access-v1 tiers)
      (whale-score
        (if (is-eq (get whale-tier data) u3) u50   ;; elite: 10K WHALE locked
          (if (is-eq (get whale-tier data) u2) u20  ;; pro: 1K WHALE locked
            (if (is-eq (get whale-tier data) u1) u5  ;; basic: 100 WHALE locked
              u0))))
    )
      (ok (+ activity-score engagement-score streak-score partner-score whale-score))
    )
    (ok u0)
  )
)

;; Governance eligibility check
(define-read-only (get-governance-tier (agent principal))
  (let ((score (get-cached-score agent)))
    (if (>= score GOVERNANCE_COUNCIL) (ok u3)
      (if (>= score GOVERNANCE_FULL) (ok u2)
        (if (>= score GOVERNANCE_BASIC) (ok u1)
          (ok u0))))
  )
)

;; Can agent execute PoXAgents actions?
(define-read-only (can-execute (agent principal))
  (>= (get-cached-score agent) GOVERNANCE_BASIC)
)

(define-read-only (get-stats)
  (ok {
    total-agents: (var-get total-agents),
    thresholds: {
      governance-basic: GOVERNANCE_BASIC,
      governance-full: GOVERNANCE_FULL,
      governance-council: GOVERNANCE_COUNCIL
    },
    max-possible-score: u620
  })
)

;; =====================================================================
;; PUBLIC - OWNER ONLY
;; =====================================================================

;; Register or update an agent's achievement flags
(define-public (set-agent-scores
    (agent principal)
    (sender bool) (receiver bool) (x402-earner bool)
    (sbtc-holder bool) (identified bool) (communicator bool)
    (connector bool) (stacker bool) (inscriber bool)
    (engagement-tier uint) (streak-tier uint)
    (partner-tier uint) (whale-tier uint)
    (notes (string-ascii 128)))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_NOT_OWNER)
    (asserts! (<= engagement-tier u4) ERR_INVALID_TIER)
    (asserts! (<= streak-tier u2) ERR_INVALID_TIER)
    (asserts! (<= partner-tier u3) ERR_INVALID_TIER)
    (asserts! (<= whale-tier u3) ERR_INVALID_TIER)
    (let (
      (is-new (is-none (map-get? agent-scores agent)))
      (score-data {
        sender: sender, receiver: receiver,
        x402-earner: x402-earner, sbtc-holder: sbtc-holder,
        identified: identified, communicator: communicator,
        connector: connector, stacker: stacker, inscriber: inscriber,
        engagement-tier: engagement-tier, streak-tier: streak-tier,
        partner-tier: partner-tier, whale-tier: whale-tier,
        registered-at: (if is-new burn-block-height
                          (get registered-at (unwrap-panic (map-get? agent-scores agent)))),
        last-updated: burn-block-height,
        notes: notes
      })
    )
      (map-set agent-scores agent score-data)
      (when is-new (var-set total-agents (+ (var-get total-agents) u1)))
      ;; Recompute and cache score
      (match (compute-score agent)
        score (begin (map-set score-cache agent score) (ok score))
        err (err err)
      )
    )
  )
)

;; Quick update: set partner tier only (most common operation)
(define-public (set-partner-tier (agent principal) (tier uint))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_NOT_OWNER)
    (asserts! (<= tier u3) ERR_INVALID_TIER)
    (match (map-get? agent-scores agent)
      data
      (begin
        (map-set agent-scores agent (merge data {
          partner-tier: tier,
          last-updated: burn-block-height
        }))
        (match (compute-score agent)
          score (begin (map-set score-cache agent score) (ok score))
          err (err err)
        )
      )
      ERR_AGENT_NOT_FOUND
    )
  )
)

;; Quick update: set WHALE tier (syncs with whale-access-v1)
(define-public (set-whale-tier (agent principal) (tier uint))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_NOT_OWNER)
    (asserts! (<= tier u3) ERR_INVALID_TIER)
    (match (map-get? agent-scores agent)
      data
      (begin
        (map-set agent-scores agent (merge data {
          whale-tier: tier,
          last-updated: burn-block-height
        }))
        (match (compute-score agent)
          score (begin (map-set score-cache agent score) (ok score))
          err (err err)
        )
      )
      ERR_AGENT_NOT_FOUND
    )
  )
)

;; Refresh score cache (call after any update)
(define-public (refresh-score (agent principal))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_NOT_OWNER)
    (match (compute-score agent)
      score (begin (map-set score-cache agent score) (ok score))
      err (err err)
    )
  )
)
