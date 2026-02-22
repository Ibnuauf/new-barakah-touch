export const initialShareState = {
    SHARE: null,
    STATEMENTS: []
}

export const shareReducer = (prevState, action) => {
    switch (action.type) {
        case 'SET_SHARE':
            return {
                ...prevState,
                SHARE: action.SHARE,
                STATEMENTS: action.STATEMENTS
            }
        case 'CLEAR_SHARE':
            return {
                ...prevState,
                SHARE: null,
                STATEMENTS: []
            }
    }
}