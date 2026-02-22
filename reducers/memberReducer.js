export const initialMemberState = {
    MEMBER: null,
    COUPONS: []
}

export const memberReducer = (prevState, action) => {
    switch (action.type) {
        case 'SET_MEMBER':
            return {
                ...prevState,
                MEMBER: action.MEMBER,
                COUPONS: action.COUPONS
            }
        case 'CLEAR_MEMBER':
            return {
                ...prevState,
                MEMBER: null,
                COUPONS: []
            }
    }
}