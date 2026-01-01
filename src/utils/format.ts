export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[date.getDay()]

  return {
    date: `${year}.${month}.${day} (${weekday})`,
    time: `${hours}:${minutes}`,
  }
}

export const formatPriceRange = (min: number, max: number) => {
  return `${min.toLocaleString()}원 ~ ${max.toLocaleString()}원`
}

export const formatBusinessNumber = (value: string) => {
  // 숫자만 추출
  const numbersOnly = value.replace(/\D/g, '').slice(0, 10)

  if (numbersOnly.length <= 3) {
    return numbersOnly
  }

  if (numbersOnly.length <= 5) {
    return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`
  }

  return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 5)}-${numbersOnly.slice(5)}`
}
