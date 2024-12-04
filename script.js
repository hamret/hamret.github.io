const kcisaApiUrl = "http://api.kcisa.kr/openapi/API_CNV_065/request";
const kcisaServiceKey = "b4ff56c8-b1eb-4fd5-a14f-b934d62cef85";

let map; // 지도 객체
let markers = []; // 마커 배열
let infoWindows = []; // 정보 창 배열

// 지도 초기화
function initMap() {
    map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(37.3595704, 127.105399), // 초기 지도 중심 (서울)
        zoom: 10 // 초기 줌 레벨
    });
}

// 검색 이벤트 처리
document.getElementById('searchForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const query = document.getElementById('queryInput').value; // 검색어
    const distance = document.getElementById('distanceInput').value; // 거리
    const resultsContainer = document.getElementById('resultsTable');

    // 검색 결과 초기화
    resultsContainer.innerHTML = "";

    // KCISA API 요청 URL 생성
    const url = `${kcisaApiUrl}?serviceKey=${kcisaServiceKey}&numOfRows=10&pageNo=1&schNm=${encodeURIComponent(query)}&dist=${distance}&type=xml`;

    // API 호출
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP 오류 발생: ${response.status}`);
            }
            return response.text();
        })
        .then(xmlText => {
            // XML 파싱
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            const items = xmlDoc.getElementsByTagName("item");

            // 기존 마커 및 정보 창 삭제
            clearMarkers();

            if (items.length > 0) {
                // 테이블 생성
                const table = document.createElement("table");

                // 테이블 헤더
                const thead = document.createElement("thead");
                const headerRow = document.createElement("tr");
                const headers = ["번호", "학교", "도서관", "주소", "운영일", "열람좌석"];
                headers.forEach(header => {
                    const th = document.createElement("th");
                    th.textContent = header;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);

                // 테이블 본문
                const tbody = document.createElement("tbody");

                Array.from(items).forEach((item, index) => {
                    const row = document.createElement("tr");

                    // 테이블 데이터
                    const schoolName = item.getElementsByTagName("schNm")[0]?.textContent || "학교 정보 없음";
                    const libraryName = item.getElementsByTagName("fcltyNm")[0]?.textContent || "도서관 정보 없음";
                    const address = item.getElementsByTagName("fcltyRoadNmAddr")[0]?.textContent || "주소 정보 없음";
                    const description = item.getElementsByTagName("description")[0]?.textContent || "운영일 정보 없음";
                    const subDescription = item.getElementsByTagName("subDescription")[0]?.textContent || "열람 좌석 정보 없음";
                    const lat = parseFloat(item.getElementsByTagName("schLatPos")[0]?.textContent || "0");
                    const lng = parseFloat(item.getElementsByTagName("schLotPos")[0]?.textContent || "0");

                    // 테이블 행 추가
                    const data = [index + 1, schoolName, libraryName, address, description, subDescription];
                    data.forEach(cellData => {
                        const td = document.createElement("td");
                        td.textContent = cellData;
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);

                    // 지도에 핀 추가
                    if (!isNaN(lat) && !isNaN(lng)) {
                        const marker = new naver.maps.Marker({
                            position: new naver.maps.LatLng(lat, lng),
                            map: map,
                            title: libraryName,
                            icon: {
                                content: `<div style="width:20px;height:20px;background-color:${getRandomColor()};border-radius:50%;"></div>`,
                            }
                        });

                        markers.push(marker);

                        // 정보 창 추가
                        const infoWindow = new naver.maps.InfoWindow({
                            content: `<div><strong>${libraryName}</strong><br>${address}</div>`,
                        });
                        infoWindows.push(infoWindow);

                        // 마커 클릭 이벤트
                        naver.maps.Event.addListener(marker, "click", () => {
                            infoWindows.forEach(win => win.close());
                            infoWindow.open(map, marker);
                        });

                        // 행 클릭 시 지도 이동
                        row.addEventListener('click', () => {
                            map.panTo(new naver.maps.LatLng(lat, lng));
                            infoWindow.open(map, marker);
                        });
                    }
                });

                table.appendChild(tbody);
                resultsContainer.appendChild(table);
            } else {
                resultsContainer.innerHTML = "<p>검색 결과가 없습니다.</p>";
            }
        })
        .catch(error => {
            console.error("오류 발생:", error);
            resultsContainer.innerHTML = `<p>오류 발생: ${error.message}</p>`;
        });
});

// 마커 초기화 함수
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    infoWindows.forEach(win => win.close());
    infoWindows = [];
}

// 랜덤 색상 생성 함수
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// 지도 초기화
initMap();
