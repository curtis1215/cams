# asset-monitoring Specification

## Purpose
TBD - created by archiving change add-asset-monitor. Update Purpose after archive.
## Requirements
### Requirement: Display asset monitoring page
The system MUST provide an asset monitoring page accessible at `/monitor/asset-monitor` that displays all currency asset statuses in a table format.

#### Scenario: User accesses asset monitoring page
**Given** user is logged in with monitoring permissions
**When** user navigates to `/monitor/asset-monitor` route
**Then** system SHALL display the asset monitoring page
**And** page SHALL contain title "資產監控" / "Asset Monitor"
**And** page SHALL display asset data table
**And** table SHALL contain all required fields

#### Scenario: Empty data state
**Given** user visits asset monitoring page
**When** system has no asset data
**Then** system SHALL display "暫無數據" / "No data available" empty state message
**And** system SHALL provide refresh button for reloading data

---

### Requirement: Display asset data fields with multi-chain support
The system MUST display the following fields in the asset monitoring table with support for distinguishing data across multiple blockchain networks.

**Required Fields:**
1. Currency (幣種) - Currency code (e.g., USDT, BTC, ETH)
2. Chain (鏈路) - Blockchain network name (e.g., ETH, BSC, TRON, POLYGON)
3. Total Holdings (持有資產數量) - Number formatted with 8 decimal places and thousand separators
4. Platform User Holdings (平台用戶持有量) - Number formatted with 8 decimal places
5. Platform Project Holdings (平台項目方持有量) - Number formatted with 8 decimal places
6. Asset Difference (資產差額) - Calculated value: Total Holdings - (User Holdings + Project Holdings)
7. 1-hour Change (近一小時變化) - Percentage value with 2 decimal places

#### Scenario: Display single currency across multiple chains
**Given** system has USDT data on three chains (ETH, BSC, TRON)
**When** user views asset monitoring table
**Then** table SHALL display three USDT records
**And** each record SHALL show different chain name
**And** each record SHALL have independently calculated asset amounts

#### Scenario: Display asset difference with color coding
**Given** a currency has negative asset difference
**When** system renders the data row
**Then** asset difference field SHALL display in red text
**And** system MAY optionally display warning icon

#### Scenario: Display change trend with indicators
**Given** USDT-ETH has 1-hour change of +5.23%
**When** system renders the data row
**Then** change field SHALL display "+5.23%" in green text
**And** SHALL display upward arrow ↑

---

### Requirement: Provide manual data refresh functionality
The system MUST provide manual data refresh capability and display the last update timestamp.

**Implementation Note**: For demo purposes, refresh will reload the same mock data with updated timestamp and simulate network delay.

#### Scenario: Manual data refresh
**Given** user is on asset monitoring page
**When** user clicks refresh button
**Then** system SHALL reload asset data (mock data)
**And** SHALL display loading animation (simulated delay 500ms-1s)
**And** SHALL update last update timestamp to current time
**And** refresh button SHALL be disabled during loading

#### Scenario: Auto-refresh (optional feature)
**Given** user has stayed on asset monitoring page for over 5 minutes
**When** system detects auto-refresh conditions
**Then** system MAY automatically reload data
**And** MAY display "數據已更新" / "Data updated" notification

---

### Requirement: Provide chain filtering functionality
The system SHALL provide functionality to filter asset data by blockchain network.

#### Scenario: Filter by single chain
**Given** user is on asset monitoring page
**When** user selects "ETH" from chain dropdown menu
**Then** table SHALL display only ETH chain asset data
**And** other chain data SHALL be hidden

#### Scenario: View all chains
**Given** user has applied chain filter
**When** user selects "全部鏈路" / "All Chains" option
**Then** table SHALL display asset data from all chains
**And** filter conditions SHALL be cleared

---

### Requirement: Provide currency search functionality
The system SHALL provide functionality to search assets by currency name.

#### Scenario: Search for specific currency
**Given** user is on asset monitoring page
**When** user types "USDT" in search box
**Then** table SHALL display only records containing "USDT"
**And** search results SHALL update in real-time

#### Scenario: Clear search
**Given** user has performed currency search
**When** user clears search box
**Then** table SHALL display all asset data
**And** SHALL restore original sort order

---

### Requirement: Support multi-language interface
The system MUST support Traditional Chinese and English interface language switching for all UI elements.

#### Scenario: Traditional Chinese interface
**Given** system language is set to Traditional Chinese
**When** user visits asset monitoring page
**Then** all interface text SHALL display in Traditional Chinese
**And** column headers SHALL use Chinese labels
**And** button text SHALL use Chinese labels

#### Scenario: English interface
**Given** system language is set to English
**When** user visits asset monitoring page
**Then** all interface text SHALL display in English
**And** column headers SHALL use English labels
**And** button text SHALL use English labels

**Translation key mappings:**
- zh: "title.assetMonitor" → "資產監控"
- en: "title.assetMonitor" → "Asset Monitor"
- zh: "field.currency" → "幣種"
- en: "field.currency" → "Currency"
- zh: "field.chain" → "鏈路"
- en: "field.chain" → "Chain"
- (additional translations in localization files)

---

### Requirement: Provide table pagination functionality
The system SHALL provide pagination functionality when the number of asset records exceeds the single-page display limit.

#### Scenario: Paginated display
**Given** system has more than 20 asset records
**When** user visits asset monitoring page
**Then** table SHALL display first 20 records
**And** SHALL display pagination controls
**And** SHALL display total record count

#### Scenario: Navigate between pages
**Given** user is on page 1 of asset monitoring
**When** user clicks page 2
**Then** table SHALL display records 21-40
**And** SHALL update current page indicator

---

### Requirement: Implement responsive design
The system SHALL correctly display the asset monitoring interface on different screen sizes.

#### Scenario: Desktop display
**Given** user is using screen width > 1200px
**When** user visits asset monitoring page
**Then** all columns SHALL display in same row
**And** SHALL not require horizontal scrolling

#### Scenario: Tablet and small screen display
**Given** user is using screen width < 1200px
**When** user visits asset monitoring page
**Then** table SHALL support horizontal scrolling
**And** core fields SHALL remain visible

---

### Requirement: Meet performance requirements
The system MUST load and render asset monitoring data within reasonable time constraints to ensure good user experience.

#### Scenario: Page load time
**Given** system has 100 asset records
**When** user visits asset monitoring page
**Then** initial load time SHALL be < 2 seconds
**And** table rendering time SHALL be < 500ms

#### Scenario: Data refresh time
**Given** user clicks refresh button
**When** system reloads data
**Then** refresh completion time SHALL be < 1 second
**And** SHALL not block other UI operations

---

