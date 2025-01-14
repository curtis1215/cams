# CAMS

## Deposit_Order

### Merchent_ID

### Deposit_Order_ID

### Chain_Type

### Token_Type

### User_ID

### Transfer_Detail
- Transfer_ID
- Transaction_ID
- TxHash
- From_Address
- To_Address
- Transfer_Amount
- Record_Create_Time
- Block_Create_Time
- First_Confirm_Time
- Second_Confirm_Time

### Create_Time

### First_Confirm_Notify_Status
- Success
- Waiting
- Retry
- Failed

### First_Confirm_Notify_Time

### Second_Confirm_Notify_Status
- Success
- Waiting
- Retry
- Failed

### Second_Confirm_Notify_Time

## Withdraw_Order

### Merchent_ID

### Withdraw_Order_ID

### Merchent_Oreser_ID

### Chain_Type

### Token_Type

### Request_Amount

### User_ID

### Transfer_Detail
- Transfer_ID
- Transfer_Status
	- Creating
	- Processing
	- Success
	- Failed
- Transaction_ID
- TxHash
- From_Address
- To_Address
- Transfer_Amount
- Record_Create_Time
- Block_Create_Time
- First_Confirm_Time

### Order_Status
- Waiting
- Processing
- Retry(Count)
- Success
- Failed

### Notify_Status
- Success
- Waiting
- Retry
- Failed

### Notify_Time

### Create_Time

## Transfer

### Transfer_ID

### Transfer_Type
- Deposit
- Internal
- External
- Withdraw
- Swap

### Transaction_ID

### Transfer_Status
- Creating
- Processing
- Success
- Failed

### From_Wallet_ID

### To_Wallet_ID

### Transfer_Amount

### TxHash

## Transaction

### Transaction_ID

### Chain_Type

### Token_Type

### Status
- Processing
- First_Confirm
- Second_Confirm
- Failed

### Block_Height

### TxHash

### Transfer_Amount

### From_Address

### To_Address

### Record_Create_Time

### Block_Create_Time

### First_Confirm_Time

### Second_Confirm_Time

### Transaction_Fee_Token_Type

### Transaction_Fee_Amount

## Wallet

### Wallet_ID

### User_ID

### Wallet_Type
- User
- Saving
- Payment
- Outbound

### Chain_Type

### Address

### Main_Token
- Balance_Amount

### Token
- Token_A
	- Balance_Amount
- Token_B
	- Balance_Amount

### Transaction
- Transaction_ID
- Token_Type
- Block_Height
- TxHash
- Transfer_Amount
- From_Address
- To_Address
- Status
	- Processing
	- First_Confirm
	- Second_Confirm
	- Failed
- Block_Create_Time

## Crypto_Settings

### Chain_Name

### Chain_Path

### Main_Token_Symbol

### Gas_Limit

### Gas_Minimum

### Gas_Price

### First_Confirmations

### Second_Confirmations

### Explorer_URL

### Price_Pair

### Daily_Transfer_Limit

### Once_Transfer_Maximum

### Once_Transfer_Minimum

### User_Wallet_Balance_Limit

### Saving_Wallet_Balance_Limit

### Payment_Wallet_Balance_Limit

### Token_List
- Token_Name
- Token_Symbol
- Contract_Address
- Token_Decimals
- Gas_Limit
- Gas_Minimum
- Gas_Price
- Price_Pair
- Daily_Transfer_Limit
- Once_Transfer_Maximum
- Once_Transfer_Minimum
- User_Wallet_Balance_Limit
- Saving_Wallet_Balance_Limit
- Payment_Wallet_Balance_Limit
