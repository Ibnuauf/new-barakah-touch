export const initialLoanState = {
    LOAN: null,
    STATEMENTS: []
}

export const loanReducer = (prevState, action) => {
    switch (action.type) {
        case 'SET_LOAN':
            return {
                ...prevState,
                LOAN: action.LOAN,
                STATEMENTS: action.STATEMENTS
            }
        case 'CLEAR_LOAN':
            return {
                ...prevState,
                LOAN: null,
                STATEMENTS: []
            }
    }
}