---
title: "What are Domain Name & DNS"
date: "2025-09-26 12:59:08"
last_modified_at: "2025-09-26 22:34:09"
categories: ["DEV", "Internet"]
tags: ["frontend", "network"]
author: "hothyun"
canonical_id: "obsidian:DEV/Internet/What are Domain Name & DNS.md"
---

## What is Domain Name?

Domain Name은 사람이 읽고 기억하기 쉽게 만들어진 인터넷 주소이다.
인터넷에 연결된 모든 장치는 고유한 IP Address를 가지고 있다. 예를 들어, 구글 웹사이트의 실제 IP 주소는 142.251.42.174와 같은 복잡한 숫자이다. 하지만, 우리가 웹사이트를 방문할 때 이 숫자를 외워서 입력하는 사람은 아무도 없다. 대신, 우리는 www.google.com 이라는 친숙한 주소를 입력한다.
여기서 www.google.com 이 바로 Domain Name이다. Domain Name은 마치 전화번호부에서 사람 이름에 해당하는 역할을 한다.

### Domain Name Structure

Domain Name은 여러 개의 Level로 구성되며, 오른쪽에서 왼쪽으로 갈수록 더 큰 범위를 나타낸다.
www.google.com 을 예료 들어 구조를 살펴보자.
- .com (최상위 도메인, TLD - Top-Level Domain): 도메인 이름의 가장 마지막 부분이며, 웹사이트의 목적이나 성격을 나타낸다.
  - 일반 최상위 도메인(gTLD): .com(상업), .org(비영리 단체), .net(네트워크), .edu(교육 기관) 등
  - 국가 코드 최상위 도메인(ccTLD): .kr(대한민국), .jp(일본), .cn(중국) 등 특정 국가를 나타낸다.
- google (2차 도메인, SLD - Second-Level Domain): 최상위 도메인 바로 앞에 있는 이름이다. 보통 기업이나 개인의 고유한 이름을 나타내며, 우리가 돈을 주고 등록하는 도메인의 핵심 부분이다.
- www (3차 도메인 or Subdomain): 2차 도메인 앞에 위치하는 이름이다. www는 “World Wide Web”의 약자로, 웹 서버를 가리키는 일반적인 관례이다. 이 외에도 mail.google.com(이메일 서버), blog.naver.com(블로그)처럼 특정 서비스를 구분하는 데 사용된다.

### Domain Name의 중요성

- 편의성: 복잡한 IP 주소를 외울 필요 없이, 사람이 기억하기 쉬운 이름으로 인터넷에 접속할 수 있게 해준다.
- 브랜딩: 기업이나 개인은 자신의 브랜드를 나타내는 고유한 도메인 이름을 사용하여 전문성과 신뢰성을 높일 수 있다. (Ex.  apple.com, nike.com)
- 유연성: 웹 서버의 물리적 위치나 IP 주소가 바뀌더라도 도메인 이름은 그대로 유지할 수 있다. 예를 들어, 구글 서버의 IP 주소가 변경되면, DNS 서버에 새로운 IP 주소만 등록하면 되므로 사용자는 주소 변경을 전혀 알 필요가 없다.

### Domain 등록과 관리

- 도메인 등록: 도메인 이름을 사용하려면 도메인 등록 대행 업체(Domain Registrar)를 통해 등록해야한다. 이 업체들은 최상위 도메인(.com, .kr 등)을 관리하는 기관(ICANN 등)에 정보를 등록하고, 사용자에게 사용료를 받는다.
- 도메인 소유권: 한 번 등록된 도메인은 등록한 사람의 소유가 되며, 다른 사람은 동일한 도메인 이름을 사용할 수 없다. 소유권은 보통 1년 단위로 갱신해야 한다.

## DNS and how it works?

DNS는 Domain Name System의 약자로, 우리말로 “도메인 이름 시스템” 이라고 한다. 간단히 말해, DNS는 사람이 읽고 기억하기 쉬운 도메인 이름(Ex. www.google.com)을 컴퓨터가 이해하는 IP 주소(Ex. 142.251.42.174)로 변환해주는 시스템이다.

### DNS의 작동 원리

DNS는 하나의 거대한 중앙 서버가 모든 정보를 관리하는 것이 아니라, 여러 계층의 DNS 서버들이 협력하여 분산된 방식으로 작동한다.
www.google.com 에 접속하는 과정을 예로 들어 DNS 작동 원리를 단계별로 알아보자.
1. Local DNS Server에 요청
  - 웹 브라우저에 www.google.com을 입력하고 엔터를 누르면, 가장 먼저 컴퓨터에 설정된 Local DNS Server로 요청을 보낸다.
  - 이 서버는 보통 우리가 사용하는 인터넷 서비스 제공업체(ISP)의 DNS 서버이다 (Ex. KT, SKT, LG U+). 이 서버는 이전에 다른 사용자들이 요청했던 기록(cache)를 가지고 있을 수 있다.
  - 만약 Local DNS Server에 www.google.com 의 IP 주소가 이미 있다면, 바로 해당 IP 주소를 알려주고 과정이 끝난다. 하지만 처음 요청하는 경우라면 다음 단계로 넘어간다.
2. Root DNS Server에 요청
  - Local DNS Server는 www.google.com 에 대한 IP 주소를 모르기 때문에, 가장 상위 단계인 Root DNS Server에게 com 도메인에 대한 정보를 물어본다.
  - 전 세계에 13개의 Root DNS Server가 있으며, 이 서버들은 최상위 도메인(.com, .org, .net 등)을 관리하는 서버의 위치를 알고 있다.
  - Root DNS Server는 “.com 도메인에 대한 정보는 이 서버(A 서버)에 물어봐” 라고 Local DNS Server에게 알려준다.
3. TLD(최상위 도메인) DNS Server에 요청
  - Local DNS Server는 Root DNS Server가 알려준 .com 도메인을 관리하는 TLD(Top-Level Domain) DNS Server에게 다시 google 도메인에 대한 정보를 물어본다.
  - .com TLD DNS Server는 “.google.com에 대한 정보는 이 서버(B 서버)에 물어봐” 라고 알려준다.
4. Authoritative DNS Server에 요청
  - Local DNS Server는 마지막으로 .google.com의 정보를 관리하는 Authoritative DNS Server에게 최종적인 www 주소에 대한 정보를 물어본다.
  - 이 서버는 www.google.com의 IP 주소 (142.251.42.174)를 정확히 알고 있다. 따라서 최종적인 IP 주소를 Local DNS Server에게 알려준다.
5. 최종 IP 주소 획득
  - Local DNS Server는 Authoritative DNS Server로부터 받은 최종 IP 주소를 브라우저에게 전달한다.
  - 이와 동시에, Local DNS Server는 다음에 같은 요청이 들어오면 빠르게 응답할 수 있도록 해당 IP 주소를 cache(저장)해둔다.
  - 이제 브라우저는 얻어낸 IP 주소(142.251.42.174)를 사용하여 구글 서버에 접속하고, 웹페이지를 요청하여 화면에 띄운다.

### DNS의 주요 구성 요소

- Domain Name: 사람이 읽기 쉬운 이름 (www.google.com)
- IP Address: 컴퓨터가 통신하는 데 사용되는 숫자 주소 (142.251.42.174)
- DNS Server: Domain Name과 IP Address를 매핑하고 저장하는 서버. 종류에 따라 역할을 분담한다.
  - Local DNS Server: ISP가 제공하며, 클라이언트의 요청을 받아 다른 DNS Server들에게 재귀적으로 물어보는 역할을 한다.
  - Root DNS Server: 가장 최상위 서버로, TLD 서버의 위치를 알려준다.
  - TLD DNS Server: 최상위 도메인(.com, .kr 등)을 관리하는 서버다.
  - Authoritative Server: 특정 도메인에 대한 최종적인 IP 주소를 가지고 있는 서버다.