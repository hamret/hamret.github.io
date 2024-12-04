const apiUrl = "http://api.kcisa.kr/openapi/API_CNV_065/request";
const serviceKey = "b4ff56c8-b1eb-4fd5-a14f-b934d62cef85";

document.getElementById('searchForm').addEventListener('submit', function (event) {
    event.preventDefault(); // 폼 기본 동작(새로고침) 방지

    const query = document.getElementById('queryInput').value; // 검색어 입력값
    const distance = document.getElementById('distanceInput').value; // 거리 입력값
    const resultsContainer = document.getElementById('resultsTable');

    // 이전 검색 결과 초기화
    resultsContainer.innerHTML = "";

    // API 요청 URL 생성
    const url = `${apiUrl}?serviceKey=${serviceKey}&numOfRows=10&pageNo=1&schNm=${encodeURIComponent(query)}&dist=${distance}&type=xml`;

    // API 호출
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP 오류 발생: ${response.status}`);
            }
            return response.text(); // XML 형식을 문자열로 받기
        })
        .then(xmlText => {
            // XML 파싱
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");

            // 데이터 처리
            const items = xmlDoc.getElementsByTagName("item");
            if (items.length > 0) {
                // 테이블 생성
                const table = document.createElement("table");

                // 테이블 헤더 생성
                const thead = document.createElement("thead");
                const headerRow = document.createElement("tr");

                // 첫 번째 열: "결과 번호" 추가
                const thIndex = document.createElement("th");
                thIndex.textContent = "번호";
                headerRow.appendChild(thIndex);

                // 나머지 열: 관심 있는 태그 이름 추가 (한글 이름)
                const tagNames = {
                    schNm: "학교",
                    fcltyNm: "도서관",
                    fcltyRoadNmAddr: "도서관주소",
                    description: "운영일",
                    subDescription: "열람좌석 및 대출가능 도서"
                };

                Object.values(tagNames).forEach(displayName => {
                    const th = document.createElement("th");
                    th.textContent = displayName;
                    headerRow.appendChild(th);
                });

                thead.appendChild(headerRow);
                table.appendChild(thead);

                // 테이블 본문 생성
                const tbody = document.createElement("tbody");

                // 각 결과(item)를 행으로 추가
                Array.from(items).forEach((item, index) => {
                    const row = document.createElement("tr");

                    // 첫 번째 열: 결과 번호
                    const indexCell = document.createElement("td");
                    indexCell.textContent = `${index + 1}`;
                    row.appendChild(indexCell);

                    // 나머지 열: 태그 값
                    Object.keys(tagNames).forEach(tagName => {
                        const cell = document.createElement("td");
                        const value = item.getElementsByTagName(tagName)[0]?.textContent || "정보 없음";
                        cell.textContent = value;
                        row.appendChild(cell);
                    });

                    tbody.appendChild(row);
                });

                table.appendChild(tbody);
                resultsContainer.appendChild(table);
            } else {
                resultsContainer.innerHTML = "<p>검색 결과가 없습니다.</p>";
            }
        })
        .catch(error => {
            resultsContainer.innerHTML = `<p>오류 발생: ${error.message}</p>`;
        });
});
