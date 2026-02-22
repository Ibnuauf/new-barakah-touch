export const initialLoanListState = {
    LOAN_LIST: null
}

export const loanListReducer = (prevState, action) => {
    switch (action.type) {
        case 'SET_LOAN_LIST':
            return {
                ...prevState,
                LOAN_LIST: action.LOAN_LIST
            }
        case 'CLEAR_LOAN_LIST':
            return {
                ...prevState,
                LOAN_LIST: null
            }
    }
}