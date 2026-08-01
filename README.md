# 2026 대한민국 정부혁신박람회 참여 안내 사이트

수요조사 기간에 참여기관과 기업이 전시 콘텐츠의 방향을 빠르게 판단하도록 만든 정적 안내 페이지입니다. 역대 박람회 개최 기록(2019–2025, 공식 출처 확인)과 기업 참여 안내를 포함합니다.

## 공개 페이지

- GitHub Pages: https://hosungseo.github.io/government-innovation-expo-archive/
- Vercel: https://government-innovation-expo-archive.vercel.app (GitHub main 푸시 시 자동 배포)

## 실행

브라우저에서 `index.html`을 열거나, 프로젝트 폴더에서 아래 명령으로 로컬 서버를 띄울 수 있습니다.

```bash
python3 -m http.server 8080
```

`http://localhost:8080`에서 확인합니다.

## 디자인 구조

- `DESIGN.md`: IBM × WIRED 편집 방향과 다섯 참고 레포의 적용 원칙
- `tokens.css`: primitive → semantic 역할로 분리한 색상·타입·간격·모션 토큰
- `styles.css`: 반응형 레이아웃과 컴포넌트 표현
- `script.js`: D-day, 모바일 메뉴, 메일 연결, 스크롤 진행, 진입 모션

## 배포 전 확인할 항목

- 2026 박람회 장소와 수요조사 최종 기준
- 문의 수신 주소
- ~~연도별 전시 콘텐츠·참고자료의 공식 원문 및 공개 범위~~ → 2026-08-01 완료: 2019–2025 공식 출처 확인, 2018·2022 미개최 확인
- 2026 기업 모집 공고 게시 시 참여 방법 섹션 갱신
- 혁신24 또는 정식 행사 사이트 이관 방식

개인정보 수집, 외부 분석 도구, 쿠키는 사용하지 않습니다.
