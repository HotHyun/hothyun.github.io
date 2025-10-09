---
title: "Jekyll Chirpy로 나만의 블로그 세팅하기 (3)"
date: "2025-10-09 12:00:00"
last_modified_at: "2025-10-09 15:09:04"
canonical_id: "obsidian:DEV/Blog/Jekyll Chirpy로 나만의 블로그 세팅하기 (3).md"
categories: [DEV, Blog]
tags: [blog, jekyll, chirpy]
author: "hothyun"
image: "/assets/img/posts/preview/DEV/Blog/2025-09-29.png"
---


# Blog Template을 내 블로그로 바꾸기

오늘은 Blog Configuration과 Blog의 스타일을 조정하는 방법에 대해서 포스팅할 것이다.

먼저, **Configuration** 먼저 바꿔보자.

## Configuration

Configuration은 이 블로그의 author, 사이드바에 들어갈 설명, 블로그의 시간대(timezone), 블로그 애널리틱스 방법, SEO Meta tag 등... 전반적인 블로그의 모든 설정들을 담는다. 이는 한 파일에 묶여있고, 때에 따라서는 다르게 분리하기도 한다. Jekyll이라는 프레임워크에서 만든 구조를 따라가고, **`_config.yml`** 파일에 기본적인 설정값들이 모두 들어간다.

지금부터 설명하는 파일은 **`_config.yml`** 파일 내의 설정이다.

### Base & SEO

가장 먼저, timezone를 세팅해주어야 한다. 한국에서 블로그를 운영할 생각이라면 lang과  timezone을 한국에 맞게 바꿔줘야한다.

```yml
lang: ko

timezone: Asia/Seoul
```

그리고 아래를 보면  title이 있을텐데, 이는 SEO에서 사용되는 title이자, 이 블로그의 사이드바에서 사용되는 title이다. 그리고 tagline은 title 아래에 나오는 subtitle이다. 필자의 경우 아래와 같이 설정하였다.

```yml
title: HotHyun Tech Blog

tagline: Software Engineer
```

그 아래에 description의 경우, SEO 상에 노출되는 description이다. title 아래에 나오는 문구로써, 다른 사용자에게 블로그를 공유할 때에도 뜨는 문구이다. 필자의 경우 아래와 같이 설정하였다.

```yml
description: >- # used by seo meta and the atom feed
  Software Engineer로써 제품을 개발하면서 습득한 지식을 공유하고, Developer Roadmap에 공부하는 CS 지식을 공유합니다.
```

그리고, url이 나오는데, url은 본인이 사용할 domain name을 써주면 된다. 필자의 경우 hothyun.com 이라는 도메인을 구매하고 사용하고 있으므로 아래와 같이 설정하였다. github pages를 이용할 예정이라면 그에 맞게 작성해주자.

```yml
# Fill in the protocol & hostname for your site.
# E.g. 'https://username.github.io', note that it does not end with a '/'.
url: "https://blog.hothyun.com"
```

그리고 그 아래는 Social Link를 세팅하는 부분이다. 필자는 여러 플랫폼 중에 github과 이메일 정도만 등록하기로 했다.

```yml
github:
    username: HotHyun # Github Name을 등록하여 전역에서 쓸 수 있게

social:
    name: HotHyun # My Name
    email: ohsong656565@gmail.com # My Email
    links:
        - https://github.com/hothyun # github homepage url
```

### Webmaster

그 다음으로 webmaster_verifications가 있다. 이는 웹사이트 소유자가 특정 검색 엔진(주로 Google, Bing 등)에서 자신의 사이트를 소유하고 있다는 것을 확인하는 절차를 의미한다. 필자의 경우 google에서 잘 보이는 것을 첫 번째 목표로 두었으므로 google에 어떻게 노출시킬 수 있을까 알아보았다.

Google Search Console에 들어가니, 크게 2가지의 선택지가 있었다.

![google search console](/assets/img/posts/contents/DEV/Blog/2025-10-09-1.png)

도메인으로 속성을 추가하는 방법과, URL 접두어로 추가하는 방법이었다. 필자는 도메인으로 속성을 추가하는 방법을 택했다. URL 접두어로 추가하는 방법에 대해서 잘 포스팅해둔 블로그 글이 있으므로 이를 첨부하겠다. [URL 접두어로 추가하기](https://jaehee-kim24.github.io/posts/github%EB%B8%94%EB%A1%9C%EA%B7%B8_%EA%B2%80%EC%83%89%EB%85%B8%EC%B6%9C%ED%95%98%EA%B8%B0/)

필자는 도메인을 cloudflare에서 구매했고, 이 DNS 관리도 cloudflare에서 자동으로 다 해주고 있었다. 그래서 도메인으로 속성을 추가하면서 DNS 인증이 필요한데, 이 부분을 cloudflare가 자동으로 다 해줬다. 이 부분에 대해서 자세하게 설명해둔 블로그 포스팅이 있어서 이를 첨부한다. [CloudFlare와 Domain으로 Google Search Console 속성 등록하기](https://www.thewordcracker.com/basic/%ED%81%B4%EB%9D%BC%EC%9A%B0%EB%93%9C%ED%94%8C%EB%A0%88%EC%96%B4-%EC%97%B0%EB%8F%99-%EC%8B%9C-%EA%B5%AC%EA%B8%80-%EC%84%9C%EC%B9%98-%EC%BD%98%EC%86%94%EC%97%90-%EB%8F%84%EB%A9%94%EC%9D%B8-%EC%86%8D/) cloudflare에 도메인을 등록하지 않으면, DNS 인증이 조금 힘든데, cloudflare에서 도메인을 사게 되면 이 부분을 쉽게 만들 수 있다. cloudflare 로그인만 해주면 자동으로 소유권 인증을 해주고, 위 블로그에 적혀있듯이 바로 소유권이 있다고 뜨지는 않는데, 기다리면 소유권이 잘 인증된다.

여기서 중요한 점! URL 접두어로 추가하기 방법을 택했다면, 소유권 증명을 위해 HTML head에 webmaster verification code가 필요하다. 그래서 _config.yml 파일에 이를 등록해줘야한다. 하지만, 필자의 경우처럼 cloudflare와 도메인으로 속성 등록하기를 이용했으면 cloudflare 측에서 소유권 증명을 해주니 verification code를 따로 세팅할 필요가 없다.

### Analytics

그리고 Web Analytics Settings가 있다. 이 부분은 google analytics 등 자신의 사이트에 들어오는 요청을 분석하여 지표로 내어주는 분석 툴들을 연동할 수 있는 부분이다. 필자의 경우 Google Analytics만을 이용하기로 했다. cloudflare에서 제공하는 analytics가 있긴 하지만, Google Analytics가 더 범용적이고 자세하게 쓰기 좋아서 등록하기로 했다.

필자가 참고했던 블로그는 이 블로그이다. [Google Analytics 등록하기](https://docs.digitalden.cloud/posts/add-google-analytics-jekyll-chirpy-site/) 자세하게 잘 설명해준다. 하지만, 이는 Jekyll Chirpy Starter가 아니라 Jekyll Chirpy 원본을 fork 한 사람들에 한해 적용할 수 있는 포스팅이다. 따라서, 이 블로그에서 **Create a Google Analytics Account** 부분만 따라해서 계정을 만들고 google analytics ID를 가져오자. 그리고 아래와 같이 google Analytics ID를 추가하자

```yml
analytics:
    google:
        id: G-XXXXXXXXXX # fill in your Google Analytics ID
```

사실 여기까지 등록하면 원래대로라면 Google Analytics가 잘 작동해야 정상이다. 하지만 잘 작동하지 않을 것이다. 그 이유는 Jekyll Chirpy Starter로 시작을 했기 때문에 원본 코드에 비해 몇 개의 코드들이 누락되었기 때문이다. 우리가 가지고 있지 않은 코드들은 아래와 같다.

- `_includes` folder
- `_javascript` folder
- `_layouts` folder

이 폴더들을 원래 Jekyll Chirpy 원본 코드에서 복사해서 우리 레포지토리에 붙여넣기를 하자. 그러면 Google Analytics가 아주 잘 작동할 것이다.

### CDN

필자의 경우, CDN을 따로 등록해두지는 않았다. 블로그를 쓸 때 이미지나 파일 같은 것들을 첨부하기 마련이다. 이를 위한 CDN(Content Delivery Network)가 있으면 좋겠지만, 필자는 그냥 github actions를 잘 써서 내 블로그 레포에 이미지가 추가되고 블로그 내에 이미지를 둠으로써 굳이 원격으로 말고 블로그 내의 이미지를 import 해서 쓰기로 결정하였다. 혹시나 파일 서버를 따로 둬서 image를 CDN 서버 링크 기반으로 하고 싶다면 이를 등록하길 바란다.

### Images

그 다음으로 avatar 필드가 나올 것이다. 이는 Sidebar의 최상단에 나오는 원형의 이미지를 등록하는 필드이다. 필자의 경우, assets 폴더 내에 img 폴더를 만들고 거기에 이미지를 저장하였다.

```yml
avatar: ./assets/img/profileImage.jpg
```

그리고 바로 아래에 social_preview_image가 있는데, 이는 SEO 상에 노출되는 이미지이다. 카카오톡 같은 곳에 링크를 올리면 preview image가 뜨지 않는가? 그 이미지를 등록하는 곳이 이 필드이다. 필자의 경우 avatar에 사용되는 이미지와 동일한 경로에 이를 저장하였다.

```yml
social_preview_image: ./assets/img/ogImage.png
```

### TOC

TOC는 Table of Contents의 약자로, 포스팅된 글을 보면 우측에 목차가 나와있을 것이다. 이 기능을 추가하냐 마냐를 결정하는 것이다. 기본은 true 이고, 만약 포스팅 마다 다르게 하고 싶다면, 포스팅될 Markdown의 Front Matter에 `toc: false`를 해주면 되겠다. 필자는 모든 글에 다 보이게 하고 싶어서 `_config.yml` 파일에 `toc: true`로 설정해두었다.

### comments

Jekyll에서는 댓글을 달 수 있는 기능을 제공하는데, Chirpy의 경우 크게 3가지를 제공한다.

- [disqus](https://disqus.com/)
- [utterances](https://utteranc.es/)
- [giscus](https://giscus.app/ko)

disqus는 다양한 소셜 플랫폼에서 로그인하여 댓글을 쓸 수 있는 기능을 제공한다. 그리고 utterances는 github issue 기반으로 댓글을 달 수 있게 해준다. 사용자가 github login을 하고 댓글을 달면 내 블로그 github repo 상에 ISSUE가 등록된다. 마지막으로 giscus는 github discussion 기반으로 댓글을 달게 해준다.

disqus는 github만을 이용하는 게 아니기 때문에 private repo 환경에서도 충분히 댓글 기능을 구현할 수 있다. 그래서 필자는 원래 disqus를 이용해서 구현을 하려고 했다. 그런데, 뭔가 디자인이 마음에 안 들어서 github discussion 기반의 giscus를 사용하게 되었다. 참고로, utterances와 giscus는 public repo에서만 사용할 수 있다. 그래서 필자는 레포를 원래 private 하게 만들었어서 public으로 변경하고 giscus를 사용하기로 했다.

giscus를 쓰려면 discussion 기능이 활성화되어야 한다. 따라서, 내 블로그 레포에 들어가서 discussion 기능을 활성화시켜주고, [giscus 페이지](https://giscus.app/ko)를 들어가보자.

![giscus-guide-1](/assets/img/posts/contents/DEV/Blog/2025-10-09-2.png)

자신의 {githubname}/{reponame} 을 입력한다.

![giscus-guide-2](/assets/img/posts/contents/DEV/Blog/2025-10-09-3.png)

discussion category를 결정한다. Announcement를 설정해도 되고 General을 설정해도 되고 본인 마음이다. 필자의 경우 General로 설정했다.

그리고 스크롤을 내리다 보면 **giscus 사용** 부분이 있을텐데, 그 아래에 \<script> 로 시작하는 코드가 있을 것이다. 그 코드를 참고하여 _config.yml에 comments 필드에 있는 giscus 정보들을 입력해주자.

```yml
comments:
    ...
    giscus:
        repo: githubname/reponame
        repo_id: blahblah
        category: General
        category_id: blahblah
        mapping: pathname
        strict: 0
        input_position: top # 이 부분은 댓글 입력란을 위에 두냐 아래에 두냐를 결정하는 필드이다.
        lang: ko
        reactions_enabled: 1 # 공감 기능이 가능한가에 대한 것이다.
```

### Paginate

마지막으로, 블로그 포스트가 많아지면 스크롤이 너무 길어질 것이다. 그래서 페이지를 몇개 단위로 나눌 수 있는데, 기본 값은 10이다. 필자도 그냥 10개씩 페이지를 분리하기로 했다.

## Data

Configuration을 어느정도 다 수정했다면, 이제 _data 폴더를 만들어서 추가적인 세팅을 해주자.

### authors.yml

authors.yml 파일이 없으면 만들어보자. 그리고 거기에 본인의 정보를 쓴다. 그러면 Front Matter에서 이 정보를 참고할 수 있게 된다.

```yml
hothyun:
    name: HotHyun
    url: https://portfolio.hothyun.com
```

이렇게 authors.yml에 쓰게 되면, 블로그를 포스팅할 Markdown의 Front Matter에서 author: hothyun 이렇게 써주면 _data/authors.yml 파일에서 hothyun field 를 찾고, 그 안에 있는 name과 url을 사용해서 자동으로 blog 글 상에 보여준다.

### contact.yml

contact.yml 파일이 없으면 만들어보자. Sidebar 아래에 Social Link가 연결된 부분이 있는데, 그 부분을 설정하는 파일이다. 필자의 경우 github와 email만 등록해두었다.

```yml
#  The contact options.

- type: github
  icon: "fab fa-github"

# - type: twitter
#   icon: "fa-brands fa-x-twitter"

- type: email
  icon: "fas fa-envelope"
  noblank: true # open link in current tab
```

### share.yml

share.yml 파일이 없으면 만들어보자. 이는 글 공유하기 옵션 중에 무엇을 추가할 것인지를 결정하는 파일이다. 필자의 경우 default 옵션으로 3가지를 놔뒀다.

```yml
platforms:
  - type: Twitter
    icon: "fa-brands fa-square-x-twitter"
    link: "https://twitter.com/intent/tweet?text=TITLE&url=URL"

  - type: Facebook
    icon: "fab fa-facebook-square"
    link: "https://www.facebook.com/sharer/sharer.php?title=TITLE&u=URL"

  - type: Telegram
    icon: "fab fa-telegram"
    link: "https://t.me/share/url?url=URL&text=TITLE"
```

## Blog Design (CSS)

Jekyll Chirpy가 정말 예쁘지만, 색상 정보들을 가끔 수정하고 싶을 때가 생긴다. 필자도 그랬다. Dark Mode에서 태그나 Hovering 되는 색을 조금 노란색조로 수정하고 싶었고, Light Mode에서도 태그 등에 조금 밝은 색을 쓰고 싶었다.

이를 수정하기 위해서는, 원래 Jekyll Chirpy 에서 파일을 하나 가져와야 한다. Jekyll Chirpy 원본 코드에 assets/css/jekyll-theme-chirpy.scss 라는 파일이 있을 것이다. 이를 복사해서 내 블로그 레포에 동일 경로에다 붙여넣기 하자. 그러면 코드가 이렇게 있을 것이다.

```scss
/* prettier-ignore */
@use 'main
{%- if jekyll.environment == 'production' -%}
  .bundle
{%- endif -%}
';

/* append your custom style below */
```

append your custom style below가 보이는가, 이 아래에 이제 추가하고 싶은 CSS를 적는다.

개발자 콘솔을 잘 이용해서 CSS를 수정하자. 필자는 은근 많이 수정했는데, 그 중 하나만 예를 들어서 설명해보겠다.

```scss
@media (prefers-color-scheme: dark) {
  html:not([data-mode]),
  html[data-mode='dark'] {
    --link-color: #ffd586; // 다크 모드에서 사용할 링크 색
    --link-underline-color: #ffd586; // 다크 모드에서 사용할 링크 underline 색
    --toc-highlight: #ffd586; // 다크 모드에서 사용할 toc에 active한 글자 색
    --link-hover-color: #efc982; // 다크 모드에서 사용할 링크 hover 색
    --tag-hover: #242427; // 다크 모드에서 사용할 tag hover 색
    .btn.btn-outline-primary:not(.disabled):hover {
      border-color: #efc982 !important;
    }
    .btn:hover {
      background-color: #efc982;
      color: #242427;
    }
  }
  html[data-mode='light'] {
    --link-color: #476eae;
    --link-underline-color: #476eae;
    --toc-highlight: #476eae;
    --link-hover-color: #3e64a3;
    .btn.btn-outline-primary:not(.disabled):hover {
      border-color: #476eae !important;
    }
    .btn:hover {
      background-color: #476eae;
      color: #fff;
    }
  }
}
```

이런 식으로 Jekyll Chirpy에서 scss 변수들을 어떻게 사용하고 있는가를 개발자 콘솔에서 확인하고, 이를 모드 별로 수정하면 Design Color를 Custom 할 수 있다.

다음 포스트에는 이제 어떻게 글을 쓰는 것을 자동화 시켰고, 호스팅은 어떻게 하고 있는지 등을 다루겠다. 그럼 이만!