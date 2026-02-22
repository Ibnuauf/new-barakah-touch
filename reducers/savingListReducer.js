export const initialSavingListState = {
    SAVING_LIST: null,
}

export const savingListReducer = (prevState, action) => {
    switch (action.type) {
        case 'SET_SAVING_LIST':
            return {
                ...prevState,
                SAVING_LIST: action.SAVING_LIST,
            }
        case 'CLEAR_SAVING_LIST':
            return {
                ...prevState,
                SAVING_LIST: null,
            }
    }
}