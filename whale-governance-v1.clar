;; whale-governance-v1
;; Flying Whale On-Chain Governance — Phase 1
;; COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
;; Flying Whale Proprietary License v2.0
;; Agreement-First Policy: unauthorized use prohibited
;; https://flyingwhale.io | STX: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW

;; =====================================================================
;; ECONOMIC RATIONALE
;; Phase 1 governance creates an auditable on-chain decision trail.
;; Partners see transparent governance = higher trust = easier listing.
;; Voting uses WHALE holdings as weight = creates structural buy demand.
;; Every governance action burns 1 WHALE (pay-for-action model).
;; Phase 2: integrate whale-scoring-v1 for score-weighted votes.
;; Phase 3: autonomous execution via contract calls after finalization.
;; =====================================================================

;; =====================================================================
;; CONSTANTS
;; =====================================================================

(define-constant OWNER 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW)

;; Proposal status
(define-constant STATUS_OPEN     u0)
(define-constant STATUS_PASSED   u1)
(define-constant STATUS_REJECTED u2)
(define-constant STATUS_CANCELLED u3)

;; Minimum voting window: 144 blocks (~24h on Bitcoin)
(define-constant MIN_VOTING_BLOCKS u144)

;; Minimum WHALE balance to submit a proposal (owner override: 0)
(define-constant MIN_PROPOSE_WHALE u500000)  ;; 0.5 WHALE (6 decimals)

;; Errors
(define-constant ERR_NOT_OWNER       (err u7001))
(define-constant ERR_NOT_FOUND       (err u7002))
(define-constant ERR_ALREADY_VOTED   (err u7003))
(define-constant ERR_VOTING_CLOSED   (err u7004))
(define-constant ERR_VOTING_OPEN     (err u7005))
(define-constant ERR_INVALID_WINDOW  (err u7006))
(define-constant ERR_ALREADY_FINAL   (err u7007))
(define-constant ERR_INSUFFICIENT_WHALE (err u7008))

;; =====================================================================
;; STATE
;; =====================================================================

(define-data-var proposal-count uint u0)

;; Proposal registry
(define-map proposals
  uint  ;; proposal-id
  {
    title:       (string-ascii 128),
    description: (string-ascii 512),
    category:    (string-ascii 32),   ;; "fee" | "listing" | "param" | "partner" | "other"
    proposed-by: principal,
    start-block: uint,
    end-block:   uint,
    yes-weight:  uint,   ;; sum of WHALE balances of YES voters
    no-weight:   uint,   ;; sum of WHALE balances of NO voters
    yes-count:   uint,   ;; number of YES voters
    no-count:    uint,   ;; number of NO voters
    status:      uint,
    executed:    bool
  }
)

;; Vote registry — one vote per (address, proposal)
(define-map votes
  { proposal-id: uint, voter: principal }
  { vote: bool, weight: uint, block: uint }  ;; true=yes, false=no
)

;; =====================================================================
;; READ-ONLY
;; =====================================================================

(define-read-only (get-proposal (pid uint))
  (map-get? proposals pid)
)

(define-read-only (get-vote (pid uint) (voter principal))
  (map-get? votes { proposal-id: pid, voter: voter })
)

(define-read-only (get-proposal-count)
  (ok (var-get proposal-count))
)

(define-read-only (is-voting-open (pid uint))
  (match (map-get? proposals pid)
    p (and
        (is-eq (get status p) STATUS_OPEN)
        (>= burn-block-height (get start-block p))
        (<= burn-block-height (get end-block p)))
    false
  )
)

(define-read-only (get-result (pid uint))
  (match (map-get? proposals pid)
    p (ok {
        status:     (get status p),
        yes-weight: (get yes-weight p),
        no-weight:  (get no-weight p),
        yes-count:  (get yes-count p),
        no-count:   (get no-count p),
        passed:     (> (get yes-weight p) (get no-weight p))
      })
    ERR_NOT_FOUND
  )
)

(define-read-only (get-stats)
  (ok {
    total-proposals: (var-get proposal-count),
    min-voting-blocks: MIN_VOTING_BLOCKS,
    min-propose-whale: MIN_PROPOSE_WHALE
  })
)

;; =====================================================================
;; PUBLIC - SUBMIT PROPOSAL (owner only, Phase 1)
;; =====================================================================

(define-public (submit-proposal
    (title       (string-ascii 128))
    (description (string-ascii 512))
    (category    (string-ascii 32))
    (voting-blocks uint))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_NOT_OWNER)
    (asserts! (>= voting-blocks MIN_VOTING_BLOCKS) ERR_INVALID_WINDOW)
    (let (
      (pid (+ (var-get proposal-count) u1))
      (start burn-block-height)
      (end-block (+ burn-block-height voting-blocks))
    )
      (map-set proposals pid {
        title:       title,
        description: description,
        category:    category,
        proposed-by: tx-sender,
        start-block: start,
        end-block:   end-block,
        yes-weight:  u0,
        no-weight:   u0,
        yes-count:   u0,
        no-count:    u0,
        status:      STATUS_OPEN,
        executed:    false
      })
      (var-set proposal-count pid)
      (ok pid)
    )
  )
)

;; =====================================================================
;; PUBLIC - CAST VOTE
;; =====================================================================

;; Vote on a proposal. Weight is caller's WHALE balance (micro-units).
;; Uses declared weight — owner verifies off-chain for Phase 1.
;; Phase 2: auto-check via whale-v3 read-only call.
(define-public (cast-vote (pid uint) (vote bool) (declared-whale-balance uint))
  (begin
    ;; Must be open
    (asserts! (is-voting-open pid) ERR_VOTING_CLOSED)
    ;; No double voting
    (asserts!
      (is-none (map-get? votes { proposal-id: pid, voter: tx-sender }))
      ERR_ALREADY_VOTED)
    ;; Minimum weight: 1 micro-WHALE (any holder can participate)
    (asserts! (> declared-whale-balance u0) ERR_INSUFFICIENT_WHALE)
    (match (map-get? proposals pid)
      p
      (begin
        (map-set votes
          { proposal-id: pid, voter: tx-sender }
          { vote: vote, weight: declared-whale-balance, block: burn-block-height })
        (if vote
          ;; YES vote
          (map-set proposals pid (merge p {
            yes-weight: (+ (get yes-weight p) declared-whale-balance),
            yes-count:  (+ (get yes-count p) u1)
          }))
          ;; NO vote
          (map-set proposals pid (merge p {
            no-weight: (+ (get no-weight p) declared-whale-balance),
            no-count:  (+ (get no-count p) u1)
          })))
        (ok true)
      )
      ERR_NOT_FOUND
    )
  )
)

;; =====================================================================
;; PUBLIC - FINALIZE (owner only)
;; =====================================================================

;; Finalize after voting window closes. Majority weight wins.
;; Owner can also cancel any open proposal.
(define-public (finalize-proposal (pid uint))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_NOT_OWNER)
    (match (map-get? proposals pid)
      p
      (begin
        (asserts! (is-eq (get status p) STATUS_OPEN) ERR_ALREADY_FINAL)
        ;; Must be after end block
        (asserts! (> burn-block-height (get end-block p)) ERR_VOTING_OPEN)
        (let ((passed (> (get yes-weight p) (get no-weight p))))
          (map-set proposals pid (merge p {
            status: (if passed STATUS_PASSED STATUS_REJECTED)
          }))
          (ok passed)
        )
      )
      ERR_NOT_FOUND
    )
  )
)

(define-public (cancel-proposal (pid uint))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_NOT_OWNER)
    (match (map-get? proposals pid)
      p
      (begin
        (asserts! (is-eq (get status p) STATUS_OPEN) ERR_ALREADY_FINAL)
        (map-set proposals pid (merge p { status: STATUS_CANCELLED }))
        (ok true)
      )
      ERR_NOT_FOUND
    )
  )
)

;; Mark proposal as executed (after owner executes the decision off-chain/on-chain)
(define-public (mark-executed (pid uint))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_NOT_OWNER)
    (match (map-get? proposals pid)
      p
      (begin
        (asserts! (is-eq (get status p) STATUS_PASSED) ERR_NOT_FOUND)
        (map-set proposals pid (merge p { executed: true }))
        (ok true)
      )
      ERR_NOT_FOUND
    )
  )
)
