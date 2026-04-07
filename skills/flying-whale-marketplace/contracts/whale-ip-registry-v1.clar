;; whale-ip-registry-v1
;; Flying Whale On-Chain Intellectual Property Registry
;;
;; COPYRIGHT 2026 Flying Whale — zaghmout.btc | ERC-8004 #54 | ALL RIGHTS RESERVED
;; Flying Whale Proprietary License v2.0 — Agreement-First Policy
;; Owner: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
;; On-chain IP: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-ip-store-v1
;; Enforcement: SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.whale-signal-registry-v1
;; Stack: Multi-Layer Sovereignty Stack v2.0.0 — Layer 1: Identity & IP Registry
;;
;; Every file, contract, tool, and API in the Flying Whale system
;; has its SHA-256 hash registered here — immutably, on Stacks mainnet.
;; Ownership is cryptographically bound to SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW.
;;
;; Verification: call (verify-hash id hash) — returns (ok true) if authentic.

;; =====================================================================
;; CONSTANTS
;; =====================================================================

(define-constant OWNER 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW)
(define-constant PLATFORM "Flying Whale | zaghmout.btc | ERC-8004 #54")

(define-constant ERR_NOT_OWNER         (err u5001))
(define-constant ERR_ALREADY_REGISTERED (err u5002))
(define-constant ERR_NOT_FOUND         (err u5003))
(define-constant ERR_ZERO_HASH         (err u5004))

;; =====================================================================
;; STORAGE
;; =====================================================================

;; Primary IP registry: id → record
(define-map ip-registry
  { id: (string-ascii 128) }
  {
    owner:          principal,
    hash:           (buff 32),
    version:        (string-ascii 32),
    category:       (string-ascii 64),
    registered-at:  uint,
    description:    (string-ascii 256)
  }
)

;; Version history: (id, version) → hash — immutable audit trail
(define-map ip-history
  { id: (string-ascii 128), version: (string-ascii 32) }
  {
    hash:          (buff 32),
    registered-at: uint
  }
)

(define-data-var total-registered uint u0)

;; =====================================================================
;; READ-ONLY
;; =====================================================================

(define-read-only (get-owner)
  (ok OWNER))

(define-read-only (get-platform)
  (ok PLATFORM))

(define-read-only (get-total)
  (ok (var-get total-registered)))

(define-read-only (get-record (id (string-ascii 128)))
  (match (map-get? ip-registry { id: id })
    record (ok record)
    ERR_NOT_FOUND))

(define-read-only (get-history (id (string-ascii 128)) (version (string-ascii 32)))
  (match (map-get? ip-history { id: id, version: version })
    record (ok record)
    ERR_NOT_FOUND))

;; Core verification: prove a file is authentic Flying Whale IP
(define-read-only (verify-hash (id (string-ascii 128)) (hash (buff 32)))
  (match (map-get? ip-registry { id: id })
    record (ok (is-eq (get hash record) hash))
    ERR_NOT_FOUND))

;; Full audit: get record + verify hash in one call
(define-read-only (audit (id (string-ascii 128)) (hash (buff 32)))
  (match (map-get? ip-registry { id: id })
    record (ok {
      authentic:      (is-eq (get hash record) hash),
      owner:          (get owner record),
      registered-at:  (get registered-at record),
      version:        (get version record),
      category:       (get category record),
      description:    (get description record)
    })
    ERR_NOT_FOUND))

;; =====================================================================
;; PUBLIC — REGISTER (OWNER ONLY)
;; =====================================================================

(define-public (register-ip
    (id          (string-ascii 128))
    (hash        (buff 32))
    (version     (string-ascii 32))
    (category    (string-ascii 64))
    (description (string-ascii 256)))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_NOT_OWNER)
    (asserts! (is-none (map-get? ip-registry { id: id })) ERR_ALREADY_REGISTERED)
    (asserts! (not (is-eq hash 0x0000000000000000000000000000000000000000000000000000000000000000)) ERR_ZERO_HASH)

    (map-set ip-registry
      { id: id }
      {
        owner:         OWNER,
        hash:          hash,
        version:       version,
        category:      category,
        registered-at: block-height,
        description:   description
      })

    (map-set ip-history
      { id: id, version: version }
      { hash: hash, registered-at: block-height })

    (var-set total-registered (+ (var-get total-registered) u1))

    (print {
      action:   "register-ip",
      platform: PLATFORM,
      data: {
        id:            id,
        owner:         OWNER,
        hash:          hash,
        version:       version,
        category:      category,
        registered-at: block-height,
        description:   description
      }
    })
    (ok true)))

;; Update hash for a new version — preserves full history
(define-public (update-ip
    (id          (string-ascii 128))
    (hash        (buff 32))
    (version     (string-ascii 32))
    (description (string-ascii 256)))
  (begin
    (asserts! (is-eq tx-sender OWNER) ERR_NOT_OWNER)
    (asserts! (not (is-eq hash 0x0000000000000000000000000000000000000000000000000000000000000000)) ERR_ZERO_HASH)

    (match (map-get? ip-registry { id: id })
      record (begin
        ;; Archive current version to history
        (map-set ip-history
          { id: id, version: (get version record) }
          { hash: (get hash record), registered-at: (get registered-at record) })

        ;; Save new version to history too
        (map-set ip-history
          { id: id, version: version }
          { hash: hash, registered-at: block-height })

        ;; Update primary record
        (map-set ip-registry
          { id: id }
          (merge record {
            hash:          hash,
            version:       version,
            description:   description,
            registered-at: block-height
          }))

        (print {
          action: "update-ip",
          data:   { id: id, hash: hash, version: version, registered-at: block-height }
        })
        (ok true))
      ERR_NOT_FOUND)))
