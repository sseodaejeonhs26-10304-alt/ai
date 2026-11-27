// 날씨와 추천은 학습용 고정 데이터입니다.
// 시각과 시차는 기기 시계와 브라우저 내장 시간대 정보로 계산합니다.
const cities = {
  tokyo: {
    name: "도쿄", country: "일본", icon: "☀️", weather: "맑음", temperature: 16,
    timeZone: "Asia/Tokyo",
    outfit: "긴팔 상의에 가벼운 재킷을 걸쳐보세요. 아침저녁에는 얇은 목도리도 좋아요.",
    items: ["가벼운 목도리", "휴대용 물병", "보조배터리"]
  },
  bangkok: {
    name: "방콕", country: "태국", icon: "🌦️", weather: "가끔 비", temperature: 31,
    timeZone: "Asia/Bangkok",
    outfit: "통풍이 잘되는 반팔과 얇은 바지를 입어보세요. 냉방이 강한 실내에서는 얇은 겉옷을 걸치세요.",
    items: ["접이식 우산", "햇빛 가릴 모자", "휴대용 물병"]
  },
  paris: {
    name: "파리", country: "프랑스", icon: "☁️", weather: "흐림", temperature: 7,
    timeZone: "Europe/Paris",
    outfit: "따뜻한 니트에 두꺼운 코트를 입어보세요. 목도리와 장갑으로 보온을 더하세요.",
    items: ["따뜻한 목도리", "장갑", "접이식 우산"]
  }
};

const citySelect = document.getElementById("city");
const emptyState = document.getElementById("empty");
const result = document.getElementById("result");

// 포매터를 한 번 만들어 재사용합니다. 파리의 서머타임도 자동 반영됩니다.
const formatters = {};
for (const timeZone of ["Asia/Seoul", ...Object.values(cities).map(city => city.timeZone)]) {
  formatters[timeZone] = {
    date: new Intl.DateTimeFormat("ko-KR", {
      timeZone, year: "numeric", month: "long", day: "numeric"
    }),
    time: new Intl.DateTimeFormat("ko-KR", {
      timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    }),
    parts: new Intl.DateTimeFormat("en-US", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    })
  };
}

// 날짜까지 비교하여 자정을 사이에 둔 두 도시의 시차도 정확히 계산합니다.
function zonedTimestamp(now, timeZone) {
  const parts = {};
  for (const part of formatters[timeZone].parts.formatToParts(now)) {
    if (part.type !== "literal") parts[part.type] = Number(part.value);
  }
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

function updateClock(now = new Date()) {
  const city = cities[citySelect.value];
  if (!city) return;
  const formatter = formatters[city.timeZone];
  document.getElementById("local-date").textContent = formatter.date.format(now);
  document.getElementById("local-time").textContent = formatter.time.format(now);
  const hours = (zonedTimestamp(now, city.timeZone) - zonedTimestamp(now, "Asia/Seoul")) / 3600000;
  document.getElementById("difference").textContent = hours === 0
    ? "한국과 시차 없음"
    : `한국보다 ${Math.abs(hours)}시간 ${hours < 0 ? "느림" : "빠름"}`;
}

function renderCity() {
  const city = cities[citySelect.value];
  emptyState.hidden = Boolean(city);
  result.hidden = !city;
  if (!city) return;

  const fields = {
    "city-name": city.name,
    country: city.country,
    "weather-icon": city.icon,
    temperature: `${city.temperature}°C`,
    weather: city.weather,
    outfit: city.outfit
  };
  for (const [id, text] of Object.entries(fields)) {
    document.getElementById(id).textContent = text;
  }

  const items = document.getElementById("items");
  items.replaceChildren();
  for (const item of city.items) {
    const li = document.createElement("li");
    li.textContent = item;
    items.appendChild(li);
  }
  updateClock();
}

citySelect.addEventListener("change", renderCity);
// 브라우저가 이전 선택을 복원하더라도 새로고침 시 초기 화면을 보여줍니다.
citySelect.value = "";
renderCity();
// 누적해서 시간을 더하지 않고 매번 기기 시계를 읽어 오차를 방지합니다.
setInterval(updateClock, 1000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateClock();
});
