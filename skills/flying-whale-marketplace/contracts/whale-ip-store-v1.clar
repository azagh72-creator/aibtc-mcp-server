;; whale-ip-store-v1
;; Flying Whale On-Chain IP Registry — Production Store
;;
;; COPYRIGHT 2026 Flying Whale - zaghmout.btc | ERC-8004 #54
;; ALL RIGHTS RESERVED — Flying Whale Proprietary License v2.0
;; Agreement-First Policy: https://flyingwhale.io
;;
;; Stores SHA-256 hashes of all Flying Whale IP files on Stacks mainnet.
;; Ownership cryptographically bound to SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW
;;
;; Verification: call (verify id hash) — returns (ok true) if authentic.
;; Registry:     call (get-ip id) — returns full record.

(define-constant OWNER 'SP322ZK4VXT3KGDT9YQANN9R28SCT02MZ97Y24BRW)
(define-constant PLATFORM "Flying Whale | zaghmout.btc | ERC-8004 #54")
(define-map ip-reg (string-ascii 64) {hash:(string-ascii 64),ver:(string-ascii 16),cat:(string-ascii 32)})
(define-data-var total uint u0)
(define-read-only (get-owner) (ok OWNER))
(define-read-only (get-platform) (ok PLATFORM))
(define-read-only (get-total) (ok (var-get total)))
(define-read-only (get-ip (id (string-ascii 64))) (map-get? ip-reg id))
(define-read-only (verify (id (string-ascii 64)) (hash (string-ascii 64))) (match (map-get? ip-reg id) r (ok (is-eq (get hash r) hash)) (err u404)))
(define-public (register (id (string-ascii 64)) (hash (string-ascii 64)) (ver (string-ascii 16)) (cat (string-ascii 32)))
  (begin
    (asserts! (is-eq tx-sender OWNER) (err u1))
    (asserts! (is-none (map-get? ip-reg id)) (err u2))
    (map-set ip-reg id {hash:hash,ver:ver,cat:cat})
    (var-set total (+ (var-get total) u1))
    (print {action:"register",owner:OWNER,id:id,hash:hash,ver:ver,cat:cat})
    (ok true)))
