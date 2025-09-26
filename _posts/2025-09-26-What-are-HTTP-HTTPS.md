---
title: "What are HTTP & HTTPS"
date: "2025-09-26 12:59:08"
last_modified_at: "2025-09-26 22:34:09"
categories: ["DEV", "Internet"]
tags: ["frontend", "network"]
author: "hothyun"
canonical_id: "obsidian:DEV/Internet/What are HTTP & HTTPS.md"
---

## What is HTTP?

HTTP는 Hypertext Transfer Protocol의 약자로, 웹에서 데이터를 주고받는 데 사용되는 가장 기본적인 애플리케이션 계층 프로토콜이다.
간단히 말해, HTTP는 웹 브라우저와 웹 서버가 서로 대화하는 규칙이다. 우리가 웹사이트에 접속하거나, 동영상을 보거나, 사진을 다운로드 하는 모든 행위는 HTTP라는 규칙에 따라 이루어진다.

### Hypertext란?

하이퍼텍스트는 링크를 통해 다른 문서로 즉시 이동할 수 있는 텍스트를 의미한다. 우리가 클릭하는 웹사이트의 파란색 링크들이 바로 하이퍼텍스트의 가장 흔한 예시이다.

### HTTP의 기본 동작 원리: Request & Response

HTTP는 Client-Server 모델을 기반으로 작동한다.
- Client: 웹 브라우저(Chrome, Firefox 등)와 같이 서버에 정보를 요청하는 주체이다.
- Server: 클라이언트의 요청을 받아 필요한 데이터를 제공하는 주체이다.
이 모델에서 모든 통신은 Client의 Request로 시작되고, 서버의 Response로 끝난다.

### HTTP의 특징

- 비연결성(Connectionless): 각 요청과 응답은 서로 독립적이며, 이전 요청이나 다음 요청의 상태를 기억하지 않는다.
  - 장점: 서버는 수많은 클라이언트 요청을 처리해야할 때, 각 클라이언트의 상태를 계속 유지할 필요가 없어 서버 자원을 효율적으로 사용할 수 있다
  - 단점: 매번 새로운 요청을 보낼 때 마다 로그인 정보와 같은 상태를 다시 보내야 하는 불편함이 있다. 이 단점을 보완하기 위해 Cookie나 Session 같은 기술이 사용된다.
- 무상태성(Stateless): 비연결성과 비슷한 개념으로, 서버는 클라이언트의 상태를 저장하지 않는다. 서버는 그저 요청에 따라 응답을 보낼 뿐이다.
- 메시지 기반(Message-Based): HTTP는 요청과 응답 메세지의 형식(Header & Body)이 정해져 있어 통신이 명확하고 이해하기 쉽다.

### HTTP 메세지의 구조

HTTP Message는 크게 Request Message, Response Message로 나뉜다. 두 Message 모두 비슷한 구조를 가진다.
1. HTTP Request Message
  - Start Line: 요청의 목적을 명시하는 첫 번째 줄이다.
    - HTTP Method: 서버가 수행할 동작을 정의한다. (Ex. GET, POST, …)
    - Request Target: 요청하는 자원의 주소이다. (Ex. /index.html, /search?query=hello…)
    - HTTP Version: 사용된 HTTP 버전(Ex. HTTP/1.1)을 명시한다.
    - Ex. GET /index.html HTTP/1.1
  - Header: 요청에 대한 추가 정보(Metadata)를 담고 있다.
    - Host: 요청하는 서버의 도메인 이름 (www.google.com)
    - User-Agent: 요청을 보낸 클라이언트의 정보 (웹 브라우저 종류 등)
    - Accept-Language: 클라이언트가 선호하는 언어
    - Cookie: 서버가 이전에 보낸 쿠키 정보
    - Content-Type: 메시지 본문에 담긴 데이터의 종류 (application/json)
  - Blank Line: 헤더와 본문을 구분하기 위한 빈 줄
  - Message Body: GET 요청에서는 보통 비어있지만, POST 요청과 같이 Client가 Server에 데이터를 전송할 때 사용한다. (Ex. Login시 ID, PW)
2. HTTP Response Message
  - Status Line: 응답의 상태를 명시하는 첫 번째 줄이다.
    - HTTP Version: 사용된 HTTP 버전(HTTP/1.1)
    - Status Code: 요청의 처리 결과를 나타내는 세 자리 숫자. (Ex. 200, 404)
    - Status Text: 상태 코드에 대한 간단한 설명 (Ex. OK, Not Found)
    - Ex. HTTP/1.1 200 OK
  - Header: 응답에 대한 추가 정보(Metadata)를 담고 있다.
    - Server: 응답을 보낸 웹 서버의 종류
    - Content-Type: 본문에 담긴 데이터의 종류 (Ex. text/html, application/json)
    - Content-Length: 본문 데이터의 길이
    - Set-Cookie: 클라이언트에게 저장할 쿠키 정보
  - Blank Line: 헤더와 본문을 구분하는 빈 줄
  - Message Body: 클라이언트가 요청한 실제 데이터가 들어있다. (HTML 문서, Image File, JSON Data…)

### HTTP Request Methods

HTTP Method는 Client가 Server에게 “이 자원에 대해 어떤 작업을 수행하고 싶은지”를 알려주는 역할을 한다.
- GET: 서버로부터 자원을 조회할 때 사용
- POST: 서버에 새로운 자원을 생성하거나 데이터를 전송할 때 사용
- PUT: 서버의 기존 자원을 완전히 대체할 때 사용
- DELETE: 서버의 자원을 삭제할 때 사용
- PATCH: 서버의 자원 일부만 수정할 때 사용
- HEAD: GET과 동일하지만, 헤더 정보만 받고 본문은 받지 않음. 링크가 유효한지, 파일 크기가 얼마나 되는지 등을 확인할 때 사용
- OPTIONS: 서버가 지원하는 메소드의 종류를 확인할 때 사용

### HTTP Status Code

HTTP Status Code는 Server가 요청을 처리한 결과를 알려주는 중요한 정보이다.
- 1xx(정보): 요청을 받았으며, 계속 진행 중이다.
- 2xx(성공): 요청을 성공적으로 처리했다
  - 200 OK: 요청 성공
  - 201 Created: 자원 생성 성공
- 3xx(리다이렉션): 요청을 완료하기 위해 추가적인 행동이 필요하다.
  - 301 Moved Permanently: 요청한 자원이 영구적으로 이동했다.
  - 302 Found: 요청한 자원이 임시적으로 다른 위치에 있다.
- 4xx(클라이언트 오류): 클라이언트의 요청에 오류가 있어 서버가 처리할 수 없다.
  - 400 Bad Request: 요청 형식이 잘못되었다.
  - 401 Unauthorized: 인증되지 않은 사용자
  - 403 Forbidden: 접근 권한이 없다
  - 404 Not Found: 요청한 자원을 찾을 수 없다.
- 5xx(서버 오류): 서버가 유효한 요청을 처리하지 못했다.
  - 500 Internal Server Error: 서버에 오류가 발생했다.
  - 503 Service Unavailable: 서버가 일시적으로 사용 불가능하다.

HTTP는 기본적으로 암호화되지 않은 평문(Plaintext) 통신이다. 중간에 누군가 패킷을 가로채면 내용이 그대로 노출된다. 이를 보완하기 위해 HTTPS가 고안되었다.

## What is HTTPS?

HTTPS는 Hypertext Transfer Protocol Secure의 약자이다. 이름에서 알 수 있듯이, 기존의 HTTP에 보안 기능이 추가된 버전이다.
HTTPS의 핵심은 SSL(Secure Sockets Layer) 또는, TLS(Transport Layer Security) 라는 암호화 프로토콜을 사용하여 웹 통신을 안전하게 보호하는 것입니다. 즉, HTTPS는 HTTP 메세지를 암호화하는 암호화 통신 계층을 추가하여 해커가 중간에서 데이터를 가로채거나 위조하는 것을 막아준다.

### SSL/TSL 프로토콜의 역할

HTTPS는 HTTP 요청과 응답을 그대로 보내는 대신, 전송 계층(Transport Layer)에서 데이터를 암호화 한다. 이 역할을 담당하는 것이 바로 SSL 또는 그 후속 버전인 TLS이다.
SSL/TLS 프로토콜은 다음과 같은 세 가지 주요 기능을 제공하여 보안을 보장한다.
1. 데이터 암호화 (Encryption): Client와 Server가 주고받는 모든 데이터를 암호화하여 제3자가 내용을 훔쳐볼 수 없도록 만든다.
2. 데이터 무결성 (Integrity): 데이터가 전송 도중에 위조되거나 변조되지 않았음을 보장한다.
3. 클라이언트 및 서버 인증 (Authentication): 통신하는 상대방이 위장된 서버나 클라이언트가 아님을 보장한다. 특히, 서버의 신원을 보증하는 데 사용된다.

### HTTPS의 작동 과정

HTTPS 통신은 복잡한 단계를 거친다. 이 과정을 HandShake라고 부르며, 마치 비밀번호와 열쇠를 주고받는 과정과 유사하다.
1. Client의 연결 요청(Client Hello)
  - 웹 브라우저가 HTTPS 주소로 서버에 접속을 시도 (Ex. https://www.google.com)
  - Client는 “SSL/TLS 통신을 하고 싶습니다” 라는 메세지와 함께 자신이 사용할 수 있는 암호화 알고리즘 목록을 서버에 보낸다.
2. 서버의 응답(Server Hello)
  -  서버는 클라이언트가 보낸 암호화 알고리즘 목록을 확인하고, 그중에서 자신이 사용할 수 있는 암호화 방식을 하나 선택하여 클라이언트에게 알린다.
  - 이와 함께, 서버는 자신의 SSL/TLS 인증서를 클라이언트에게 보낸다.
3. 클라이언트의 인증서 검증
  - 클라이언트는 서버로부터 받은 인증서를 검사한다.
    - 인증서가 유효한지? (만료일, 서명기관 등 확인)
    - 인증서의 발급 기관이 신뢰할 수 있는 기관인지? (운영체제에 내장된 인증서 목록과 비교)
    - 접속하려는 사이트 주소와 인증서의 주소가 일치하는지?
  - 이 과정이 실패하면 “이 웹사이트는 안전하지 않습니다” 라는 경고 메시지가 표시된다.
  - 이 과정이 성공하면, 클라이언트는 서버의 공개키를 인증서에서 추출한다.
4. 클라이언트의 비밀키 전송
  - 클라이언트는 대칭키를 생성한다. (실제 데이터 암호화에 사용될 비밀키)
  - 이 대칭키를 서버의 공개키로 암호화한다.
  - 암호화된 대칭키를 서버에게 보낸다.
5. 서버의 비밀키 복호화
  - 서버는 클라이언트가 보낸 암호화된 대칭키를 자신의 비밀키로 복호화한다.
  - 이제 클라이언트와 서버는 모두 동일한 대칭키를 가지게 된다.
6. 암호화된 통신 시작
  - 클라이언트와 서버는 앞서 공유한 대칭키를 사용하여 HTTP 데이터를 암호화하고 복화하하며 안전하게 통신한다.
이 과정을 정리하면, Client에서 생성한 대칭키를 Server에 Deliver하는 데에는 비대칭키 암호화(Asymmetric Key Cryptography)를 이용하고, Client, Server의 통신 상에는 대칭키 암호화(Symmetric Key Cryptography)를 이용하는 것이 핵심이다.
- Client에서 요청할 때 가능한 암호화 알고리즘을 미리 서버에 알려주고, 서버는 그 중에서 가장 선호하는 암호화 알고리즘과 SSL/TLS 인증서를 보낸다.
  - 여기서 중요한 점은, 비대칭키 암호화 알고리즘과 대칭키 암호화 알고리즘을 모두 골라야 한다는 것이다. 대칭키 암호화 알고리즘은 Client, Server 간의 통신에 사용되며, 비대칭키 암호화 알고리즘은 Client가 Server에 대칭키를 Deliver 하는 과정에서 사용된다.
- 여기서 Client, Server에서 통신 시 데이터를 암호화할 때 사용되는 알고리즘이 확정된다.
- Client가 이를 받으면, 인증서의 유효성을 체크한 뒤, 인증서에서 서버의 공개키를 추출한다.
- Client에서 임의의 대칭키를 생성하고, 이 대칭키를 서버의 공개키를 기반으로 비대키 암호화 알고리즘을 이용하여 암호화시킨다. 그리고 이를 Server로 보낸다
- Server에서는 이를 받아서 서버의 비밀키를 이용하여 복호화한다. 여기서, 비대칭키 암호화 알고리즘이 사용된다.
- 이후에 Client, Server가 모두 동일한 대칭키를 가지게 되고, 이 키를 이용하여 데이터를 암호화하고 복호화하며 안전하게 통신한다.