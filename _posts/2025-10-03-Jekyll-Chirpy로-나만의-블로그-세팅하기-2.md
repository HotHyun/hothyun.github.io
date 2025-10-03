---
title: "Jekyll Chirpy로 나만의 블로그 세팅하기 (2)"
date: "2025-10-02 12:00:00"
last_modified_at: "2025-10-03 22:58:58"
canonical_id: "obsidian:DEV/Blog/Jekyll Chirpy로 나만의 블로그 세팅하기 (2).md"
categories: [DEV, Blog]
tags: [blog, jekyll, chirpy]
author: "hothyun"
image: "/assets/img/posts/preview/DEV/Blog/2025-09-29.png"
---


이전 포스팅에서 Jekyll과 SSG, Jekyll Theme에 대해서 이야기했다. 이번 포스팅은 내가 어떤 Jekyll Theme을 골랐고, 현재 어떻게 세팅을 했는지에 대한 이야기를 담을 것이다.

# Jekyll Chirpy

현재 필자가 사용하고 있는 Jekyll Theme은 [Jekyll Chirpy](https://chirpy.cotes.page/) 이다. 왜 이 테마를 골랐는가? 라고 물어본다면, 일단 디자인이 필자의 취향과 맞았고, Jekyll에서의 대부분의 기능을 지원을 잘 하고 많지는 않지만 여전히 업데이트가 계속 되고 있는 테마인 것 같아서 이를 골랐다.

필자는 Jekyll을 잘 모르는 사람이었기에, 이 Theme을 쓰기 위한 가이드 문서를 찾았다. 찾아보니 [Getting Started](https://chirpy.cotes.page/posts/getting-started/) 문서가 있었다. 여기에 설명이 잘 되어있어서 보고 따라하면 되는데, 한번 차근차근 따라가보자.

먼저, Jekyll Chirpy의 코드는 github에 올라가있다. 그래서 코드를 가져와서 내 개인 블로그를 세팅하려면 github의 계정이 있어야 한다. github 계정이 있다면, 어떤 코드를 가져올지를 선택해야하는데, 필자처럼 처음하는 초보자용 Starter 코드가 있고 Jekyll을 조금 쓸줄 아는 사람들을 위한 원본 코드가 있다. 필자는 Starter 코드를 사용했는데, 만약 다시 블로그 셋업을 한다면 무조건 원본 코드를 선택할 것 같다. Starter 코드는 빠르게 작업하기 좋은데, 일부 기능들에 대한 코드가 없어서 기능 사용이 불가능해지는 경우가 생긴다. 필자의 경우, **Google Analytics**를 사용하려는데, Starter 코드에는 관련 코드가 들어있지 않아서 설정하는 데에 시간이 조금 오래 걸렸다. 그래서 정말 블로그를 잘 운영할 생각이라면 꼭 원본 코드를 사용하길 바란다.

이번 글은 Starter 코드로 블로그 셋업을 한 필자의 방식으로 글을 서술할 것이다.

## Blog 코드를 가져오고 로컬에서 Build 시켜보기

1. 먼저, starter 코드가 있는 [github 링크](https://github.com/cotes2020/chirpy-starter) 로 들어간다.
2. 아래 사진 우측 상단에 있는 **Use Template** 버튼을 누른 뒤, **Create a new repository** 를 클릭한다.

   ![Use Template 설명 사진](/assets/img/posts/contents/DEV/Blog/2025-10-03-1.png)

3. Repository의 이름을 설정해야하는데, 공식 문서 상에는 **{username}.github.io** 로 설정하라고 한다.

이렇게 새 Repository를 만들게 되면, 내가 블로그를 잘 만들고 있는지를 확인하기 위해 build 하는 방법을 알아야 한다. 이전 포스팅에서 SSG의 개념을 설명했는데, 결국 빌드된 파일이 있어야 포스팅을 쉽게 불러올 수 있고, 이 빌드된 파일이 있다면 실제로 배포하기 전에 잘 빌드가 되었는지와 포스트가 잘 올라갈 지를 확인할 수 있다.

빌드를 하기 위해서는, 가장 먼저 CLI를 실행시킬 수 있는 환경을 마련해야한다. CMD가 되었던, iTerm이 되었던, Bash가 되었던 우리는 일단 CLI를 통해 빌드를 시킬거다. 참고로, 지금 진행하고 있는 환경은 UNIX 체제 기반의 환경이다. Window는 Docker를 쓰는 게 좋다고 한다.

빌드를 위해서는 필수적으로 Jekyll과 git이 필요하다. 공식 문서는 아래와 같다.

- [Jekyll Installation Guide](https://jekyllrb.com/docs/installation/)
- [Git Installation Guide](https://git-scm.com/)

필요한 도구들이 설치되었다면, 가장 먼저 코드를 가져와보자. 내가 코드를 가져오려고 하는 경로에 접근하여 `git clone https://github.com/{username}/{reponame}.git` 을 통해 코드를 가져온다. 그리고, VS Code를 사용하는 사람이라면 VS Code로 해당 폴더를 열고, 터미널로 계속하실 분이라면 cd 커맨드를 이용하여 복제한 코드의 경로로 이동한다.

일단 아무런 세팅도 하지 않은 채, 빌드가 잘 되고 빌드 파일을 잘 조회할 수 있는지를 확인하기 위해 아래의 커맨드를 실행시켜보자. 아래의 커맨드는 현재 Jekyll Chirpy를 빌드하고 빌드된 파일 기반의 로컬 서버를 실행시키는 커맨드이다.

```bash
$ bundle exec jekyll serve
```

위 커맨드를 실행시키고 에러가 나지 않는다면, 파일이 빌드되고 로컬 서버가 켜질 것이다. 우리는 http://127.0.0.1:4000 의 경로에서 이를 확인할 수 있을 것이다.

이 까지의 과정이 잘 완료되었다면, 이제 블로그를 꾸미거나, 블로그에 필요한 나의 인적 정보들을 넣어주면 된다. 해당 과정은 다음 포스팅 때 적겠다.

# References

- [Getting Started](https://chirpy.cotes.page/posts/getting-started/)
- [Jekyll Installation Guide](https://jekyllrb.com/docs/installation/)
- [Git Installation Guide](https://git-scm.com/)
