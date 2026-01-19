## ADDED Requirements

### Requirement: Submitter and Reviewer Information Display
The system SHALL display submitter (提交人) and reviewer (審核人) username information in wallet management and transfer related pages.

#### Scenario: Wallet management displays submitter
- **WHEN** user views the wallet list in Query.vue
- **THEN** the table SHALL include a "createdBy" column showing the username who created the wallet

#### Scenario: Transfer list displays submitter and reviewer
- **WHEN** user views the transfer list in Transfer.vue
- **THEN** the table SHALL include "submitter" column showing the username who submitted the transfer request
- **AND** the table SHALL include "reviewer" column showing the username who reviewed the transfer (if reviewed)

#### Scenario: Transfer record list displays submitter and reviewer
- **WHEN** user views the transfer record list in TransferRecord.vue
- **THEN** the table SHALL include "submitter" column showing the username who submitted the transfer
- **AND** the table SHALL include "reviewer" column showing the username who reviewed the transfer (if reviewed)

#### Scenario: Audit detail modal displays submitter and reviewer
- **WHEN** user opens the audit detail modal in Transfer.vue for a reviewed transfer
- **THEN** the modal SHALL display the submitter username
- **AND** the modal SHALL display the reviewer username
