export const initialSavingState = {
    SAVING: null,
    STATEMENTS: []
}

export const savingReducer = (prevState, action) => {
    switch (action.type) {
        case 'SET_SAVING':
            return {
                ...prevState,
                SAVING: action.SAVING,
                STATEMENTS: action.STATEMENTS
            }
        case 'CLEAR_SAVING':
            return {
                ...prevState,
                SAVING: null,
                STATEMENTS: []
            }
    }
}