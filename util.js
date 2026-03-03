import numeral from 'numeral'
import moment from 'moment'

// format การแสดงผลเวลาให้อยู่ในรูปแบบ 00:00
export const prettyTime = (stat) => {
    if (stat) {
        return numeral(stat).format('00:00:00').split(':').slice(1).join(':')
    } else {
        return numeral(0).format('00:00:00').split(':').slice(1).join(':')
    }
}

// format การแสดงผลจำนวนเงินให้อยู่ในรูปแบบ ตัวอย่าง 1,000.00
export const prettyAmount = (stat) => {
    if (stat) {
        let amount = stat;
        return numeral(amount).format('0,0.00').split(':')
    } else {
        return numeral(0).format('0,0.00').split(':')
    }
}

// format การลบเครื่องหมาย (-) ออกจากหมายเลขหุ้นหรือหมายเลขบัญชี
export const removeDash = (string) => {
    if (string) {
        return string.split('-').join('')
    } else {
        return ''
    }
}

// format การเพิ่มเครื่องหมาย (-) ให้หมายเลขหุ้นเพื่อแสดงผล
export const shareNumberFormat = (string) => {
    if (string) {
        return string.slice(0, 3) + '-' + string.slice(3, 5) + '-' + string.slice(5, 10)
    } else {
        return ''
    }
}

// format การเพิ่มเครื่องหมาย (-) ให้หมายเลขบัญชีเพื่อแสดงผล
export const accountNumberFormat = (string) => {
    if (string) {
        return string.slice(0, 3) + '-' + string.slice(3, 5) + '-' + string.slice(5, 10) + '-' + string.slice(10, 11)
    } else {
        return ''
    }
}

// format การแยกประเภทบัญชี เช่น '01' คือบัญชีหุ้น, '02' คือบัญชีวาดีอะฮ์
export const getAccountType = (string) => {
    if (string.length === 13 && !string.includes('/')) {
        return 'bk'
    } else if (string.length === 10) {
        if (string.slice(0, 2) !== '00' && string.slice(0, 2) !== '01') {
            return 'bk'
        }
    }

    return string.slice(3, 5)
}

// ฟังก์ชันสำหรับแยกรายการโปรดแต่ละประเภท
export const getFavoriteShares = (array) => {
    const favoriteShares = array.filter(
        item => getAccountType(item.ACC_TYPE) === '01'
    )

    return favoriteShares
}

export const getFavoriteAccounts = (array) => {
    const favoriteAccounts = array.filter(item => {
        const type = getAccountType(item.ACC_TYPE)

        if (type === '02' || type === '03' || type === '04' || type === '05' || type === '06') {
            return item
        }
    })

    return favoriteAccounts
}

export const getFavoriteLoans = (array) => {
    const favoriteLoans = array.filter(item => {
        if (item.ACC_TYPE.includes('/')) {
            return item
        }
    })

    return favoriteLoans
}

export const getFavoriteBank = (array) => {
    const favoriteLoans = array.filter(item => {
        const type = getAccountType(item.ACC_TYPE)

        if (type === 'bk') {
            return item
        }
    })

    return favoriteLoans
}

//  แปลงจำนวนเงิน (string) เป็นจำนวนเงิน (int)
export const getAmount = (string) => {
    const amount = +string.split(',').join('')

    return amount
}

//  ตรวจสอบว่าเป็นจำนวนเต็มหรือไม่ (ระบบไม่อนุญาตสตางค์)
export const isInteger = (number) => {
    if (number % 1 === 0) {
        return true
    } else {
        return false
    }
}

// ================ ฺBANKS =================== //

export const banks = [
    {
        BANK_CODE: '002',
        name: 'กรุงเทพ',
        symbol: 'BBL',
        logo: require('./assets/bank/bbl.png'),
    },
    {
        BANK_CODE: '004',
        name: 'กสิกรไทย',
        symbol: 'KBANK',
        logo: require('./assets/bank/kbank.png'),
    },
    {
        BANK_CODE: '006',
        name: 'กรุงไทย',
        symbol: 'KTB',
        logo: require('./assets/bank/ktb.png'),
    },
    {
        BANK_CODE: '011',
        name: 'ทีเอ็มบีธนชาต',
        symbol: 'ttb',
        logo: require('./assets/bank/ttb.png'),
    },
    {
        BANK_CODE: '014',
        name: ' ไทยพาณิชย์ ',
        symbol: 'SCB',
        logo: require('./assets/bank/scb.png'),
    },
    {
        BANK_CODE: '022',
        name: 'ซีไอเอ็มบี',
        symbol: 'CIMBT',
        logo: require('./assets/bank/cimbt.png'),
    },
    {
        BANK_CODE: '025',
        name: 'กรุงศรี',
        symbol: 'BAY',
        logo: require('./assets/bank/bay.png'),
    },
    {
        BANK_CODE: '030',
        name: 'ออมสิน',
        symbol: 'GSB',
        logo: require('./assets/bank/gsb.png'),
    },
    {
        BANK_CODE: '033',
        name: 'ธ.อ.ส.',
        symbol: 'GHB',
        logo: require('./assets/bank/ghb.png'),
    },
    {
        BANK_CODE: '034',
        name: 'ธ.ก.ส.',
        symbol: 'BAAC',
        logo: require('./assets/bank/baac.png'),
    },
    {
        BANK_CODE: '066',
        name: 'ธนาคารอิสลาม ',
        symbol: 'ISBT',
        logo: require('./assets/bank/isbt.png'),
    },
    {
        BANK_CODE: '067',
        name: 'ทิสโก้',
        symbol: 'TISCO',
        logo: require('./assets/bank/tisco.png'),
    },
    {
        BANK_CODE: '069',
        name: 'เกียรตินาคินภัทร',
        symbol: 'KKP',
        logo: require('./assets/bank/kkp.png'),
    },
    // {
    //     name: 'ยูโอบี',
    //     symbol: 'UOBT',
    //     logo: require('./assets/bank/uobt.png'),
    // },
    // {
    //     name: 'เกียรตินาคินภัทร',
    //     symbol: 'KKP',
    //     logo: require('./assets/bank/kkp.png'),
    // },
    // {
    //     name: 'ซีไอเอ็มบี',
    //     symbol: 'CIMBT',
    //     logo: require('./assets/bank/cimbt.png'),
    // },
    // {
    //     name: 'แลนด์ แอนด์ เฮาส์',
    //     symbol: 'LHB',
    //     logo: require('./assets/bank/lhb.png'),
    // },
    // {
    //     name: 'ไอซีบีซี (ไทย)',
    //     symbol: 'ICBCT',
    //     logo: require('./assets/bank/icbct.png'),
    // },
    // {
    //     name: 'ไทยเครดิต',
    //     symbol: 'TCR',
    //     logo: require('./assets/bank/tcr.png'),
    // },
    // {
    //     name: 'ซิตี้แบงก์',
    //     symbol: 'CITI',
    //     logo: require('./assets/bank/citi.png'),
    // },
    // {
    //     name: 'เอชเอสบีซี',
    //     symbol: 'HSBC',
    //     logo: require('./assets/bank/hsbc.png'),
    // },
    // {
    //     name: 'สแตนดาร์ดชาร์เตอร์ด',
    //     symbol: 'SCBT',
    //     logo: require('./assets/bank/scbt.png'),
    // },
    // {
    //     name: 'ซูมิโตโม มิตซุย',
    //     symbol: 'SMBC',
    //     logo: require('./assets/bank/smbc.png'),
    // },
    // {
    //     name: 'มิซูโฮ',
    //     symbol: 'MIZUHO',
    //     logo: require('./assets/bank/mizuho.png'),
    // },
    // {
    //     name: 'ดอยซ์แบงก์',
    //     symbol: 'DB',
    //     logo: require('./assets/bank/db.png'),
    // },
]

export const searchBankIcon = (bankCode) => {
    const bank = banks.find(bank => bank.BANK_CODE === bankCode)

    return bank.logo
}

export const searchBankName = (bankCode) => {
    const bank = banks.find(bank => bank.BANK_CODE === bankCode)

    return bank.name
}

export const bankAccountNumberFormat = (accountNumber) => {
    const accountSlice = accountNumber.slice(accountNumber.length - 4, accountNumber.length)

    let string = ''

    for (let i = 0; i < accountNumber.length; i++) {
        if (i < accountNumber.length - 4)
            string = string + 'x'
    }

    if (accountNumber.length === 10) {
        return 'xxx-xxx' + accountSlice.slice(0, 3) + '-' + accountSlice.slice(3, 4)
    } else {
        return string + accountSlice
    }
}

export const hideAccountNumber = (string) => {
    return 'xxx-xx-xx' + string.slice(7, 10) + '-' + string.slice(10, 11)
}

const getMonth2 = (stat) => {
    switch (stat) {
        case 0: return 12
        case -1: return 11
        case -2: return 10
        case -3: return 9
        case -4: return 8
        case -5: return 7
        case -6: return 6
        case -7: return 5
        case -8: return 4
        case -9: return 3
        case -10: return 2
        case -11: return 1
        default: return stat
    }
}

export const getMonths = () => {
    let month = moment().format('MM')
    let year = moment().format('YYYY')
    let monthList = []

    for (let i = 0; i < 6; i++) {
        let monthInt = getMonth2(+month - i)
        let yearInt = (+month - i) > 0 ? +year : +year - 1

        monthList.push({ m: monthInt, y: yearInt })
    }

    return monthList
}

const getMonth = (stat) => {
    const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]

    if (stat > 0) {
        return months[stat - 1]
    } else {
        return null
    }
}

export const getThaiMonth = (stat, string) => {
    const thaiMonthShort = [
        'ม.ค.',
        'ก.พ.',
        'มี.ค.',
        'เม.ย.',
        'พ.ค.',
        'มิ.ย.',
        'ก.ค.',
        'ส.ค.',
        'ก.ย.',
        'ต.ค.',
        'พ.ย.',
        'ธ.ค.'
    ]
    const thaiMonthFull = [
        'มกราคม',
        'กุมภาพันธ์',
        'มีนาคม',
        'เมษายน',
        'พฤษภาคม',
        'มิถุนายน',
        'กรกฎาคม',
        'สิงหาคม',
        'กันยายน',
        'ตุลาคม',
        'พฤศจิกายน',
        'ธันวาคม'
    ]

    if (string === 'full') {
        const monthTH = thaiMonthFull[stat - 1]
        return monthTH
    } else {
        const monthTH = thaiMonthShort[stat - 1]
        return monthTH
    }
}

export const showMonth = (item) => {
    const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
    const monthStr = months[item.m - 1]

    return monthStr + ' ' + (item.y + 543)
}

export const readBankQr = (string) => {
    let amount = ''
    const indexA = string.indexOf('A')
    const qrType = string.slice(indexA + 16, indexA + 20)

    if (string.includes('.')) {
        const replaceString = string.replace('5802TH', '')
        const code = replaceString.slice(60, 64)

        if (code.slice(0, 2) === '54') {
            const len = +(code.slice(2, 4))
            amount = replaceString.slice(64, 64 + len)
        } else {
            return null
        }
    }

    if (+qrType.slice(2, 4) !== 13) {
        return null
    } else {
        switch (qrType.slice(0, 2)) {
            case '01': {
                const qrNumber = string.slice(indexA + 20, indexA + 33)
                const phoneNumber = qrNumber.replace('0066', '0')
                return [phoneNumber, amount]
            }
            case '02': {
                const idcardNumber = string.slice(indexA + 20, indexA + 33)
                return [idcardNumber, amount]
            }
            // case '03': {
            //     const billNumber = string.slice(indexA + 20, indexA + 35)
            //     return [billNumber, amount]
            // }
            default: return null
        }
    }
}

export const dateSlipFormat = (string) => {
    if (!string) {
        return null
    } else {
        const month = getMonth(+string.slice(3, 5))
        const dateSlipFormat = string.slice(0, 2) + ' ' + month + ' ' + `25${string.slice(6, 8)}` + ' - ' + string.slice(9, string.length)

        return dateSlipFormat
    }
}

export const getAccountTypeName = (accountNo) => {
    if (accountNo) {
        const code = getAccountType(accountNo)

        if (code === '02') {
            return 'วาดีอะฮ์'
        } else if (code === '03') {
            return 'มูฎอรอบะฮ์'
        } else if (code === '05') {
            return 'ฮัจย์และอุมเราะฮ์'
        }
    } else {
        return '-'
    }
}