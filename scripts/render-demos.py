"""Render two original, silent cartoon concept videos. Development only.

Requires Pillow and imageio-ffmpeg. No supplied or AI image is modified here;
every animation frame is drawn from geometric primitives.
"""
from pathlib import Path
import math
import subprocess
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public/assets/video'
POSTERS = ROOT / 'public/assets/concepts'
OUT.mkdir(parents=True, exist_ok=True)
POSTERS.mkdir(parents=True, exist_ok=True)
W, H, FPS, SECONDS = 1280, 720, 24, 6
INK, GREEN, LIME, SAND, SKY, ORANGE = '#12372d', '#23775a', '#b7f63b', '#e9eee2', '#dbece7', '#e9a15e'

def font(size, bold=False):
    paths = [Path('C:/Windows/Fonts') / ('segoeuib.ttf' if bold else 'segoeui.ttf'), Path('/usr/share/fonts/truetype/dejavu') / ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')]
    for candidate in paths:
        if candidate.exists(): return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default(size=size)

def rr(d, box, fill, radius=16, outline=None, width=1):
    d.rounded_rectangle(tuple(map(int,box)), radius=radius, fill=fill, outline=outline, width=width)

def person(d,x,y,s=1,phase=0):
    def line(points, color, width): d.line([(int(x+a*s),int(y+b*s)) for a,b in points], fill=color, width=max(1,int(width*s)))
    def box(bounds,color,r=8): rr(d,[x+bounds[0]*s,y+bounds[1]*s,x+bounds[2]*s,y+bounds[3]*s],color,int(r*s))
    line([(-12,44),(-16,103)],INK,15); line([(12,44),(19,103)],INK,15)
    box((-28,94,-7,106),'#16342f'); box((10,94,36,106),'#16342f')
    box((-28,-14,28,60),'#25475b',14)
    line([(-22,1),(-44,35)],'#25475b',16); line([(22,2),(42,24+phase*4)],'#25475b',16)
    box((-30,28,28,35),LIME,0)
    d.ellipse((x-20*s,y-57*s,x+20*s,y-13*s),fill='#bd8d6a')
    d.pieslice((x-25*s,y-72*s,x+25*s,y-20*s),180,360,fill='#f8faf2')
    box((-31,-46,31,-38),'#fbfcf7',4)
    line([(-20,-29),(20,-29)],INK,4)
    box((-60,8,-28,39),GREEN,4);line([(-55,17),(-36,17)],LIME,2)

def tree(d,x,y,s=1):
    d.line((x,y,x,y+70*s),fill='#64866c',width=int(9*s))
    d.ellipse((x-28*s,y-45*s,x+28*s,y+20*s),fill='#86ad81')
    d.ellipse((x-48*s,y-20*s,x+1*s,y+33*s),fill='#8fb68a')

def base(index,t):
    im=Image.new('RGB',(W,H),SKY);d=ImageDraw.Draw(im)
    d.ellipse((840,-170,1430,430),fill='#edf4d5')
    d.ellipse((-180,300,780,850),fill='#bfd4b7');d.ellipse((530,300,1500,950),fill='#acc9a6')
    for x,y in [(90,365),(1160,320),(1050,350)]:tree(d,x,y,.7)
    d.rectangle((0,510,W,H),fill=SAND)
    d.ellipse((160,492,1120,600),fill='#d0dbcd')
    rr(d,(42,32,194,78),INK,23);d.text((65,38),'GETG',font=font(25,True),fill=LIME)
    d.text((1150,31),f'{index:02}',font=font(38,True),fill=INK)
    for i in range(3):
        rr(d,(500+i*100,653,580+i*100,658),'#c3d1c3',2)
        progress=min(1,max(0,(t-i*2)/2))
        if progress>0:rr(d,(500+i*100,653,500+i*100+80*progress,658),GREEN,2)
    return im,d

def badge(d,x,y,t):
    radius=30+2*math.sin(t*3)
    d.ellipse((x-radius,y-radius,x+radius,y+radius),fill=LIME,outline=INK,width=2)
    d.line((x-12,y,x-3,y+9,x+15,y-10),fill=INK,width=5)

def scene_three(d,t):
    # A simplified cutaway with explicitly illustrative buildup and flow.
    rr(d,(170,290,1100,466),INK,34)
    rr(d,(170,307,1100,449),'#bad7cf',23)
    for x in [240,1000]:rr(d,(x,273,x+27,483),GREEN,5,INK,3)
    open_ratio=max(0,min(1,(t-1.7)/3))
    deposit=68*(1-open_ratio)+5
    for x in range(490,730,22):
        r=deposit*(.7+.3*math.sin(x))
        d.ellipse((x-24,302-r*.25,x+24,302+r),fill='#a17a4f')
        d.ellipse((x-24,451-r,x+24,451+r*.25),fill='#a17a4f')
    for i in range(16):
        x=190+((i*73+t*(75+open_ratio*80))%880)
        y=360+(i%3)*18
        d.line((x-18,y,x+10,y),fill=GREEN,width=5)
        d.polygon([(x+10,y-5),(x+18,y),(x+10,y+5)],fill=GREEN)
    d.line((600,288,600,212),fill=INK,width=12)
    d.ellipse((561,150,639,228),fill='#f5f8eb',outline=INK,width=5)
    angle=-.8+open_ratio*1.3
    d.line((600,189,600+25*math.sin(angle),189-25*math.cos(angle)),fill=GREEN,width=5)
    person(d,330,552,.6)
    if t>4.5:badge(d,907,215,t)

def scene_four(d,t):
    # Stylized separation concept; no claim about a specific treatment process.
    rr(d,(315,245,652,502),'#f8faf2',25,INK,6)
    rr(d,(331,310,636,484),'#8abcb0',10)
    d.rectangle((331,310,636,340),fill='#bd9b66')
    d.line((190,235,250,235,250,370,315,370),fill=GREEN,width=24)
    d.line((652,423,760,423,760,353,850,353),fill=GREEN,width=24)
    rr(d,(845,292,1050,500),'#d1e5dc',21,INK,5)
    level=min(1,max(0,(t-2)/3))
    if level>0:rr(d,(858,485-160*level,1037,485),'#79b4a3',9)
    d.line((425,267,425,465),fill='#c0cebc',width=9)
    d.line((542,267,542,465),fill='#c0cebc',width=9)
    for i in range(23):
        x=349+(i*47)%270;y=362+(i*29)%100
        y-=min(t/4,1)*(y-325)
        d.ellipse((x-4,y-4,x+4,y+4),fill='#806d50')
    for i in range(5):
        x=665+((i*31+t*50)%157);d.ellipse((x-4,419,x+4,427),fill=LIME)
    d.ellipse((170,521,1080,550),fill='#b2c9b3')
    person(d,191,468,.82)
    if t>4.5:badge(d,1096,280,t)

scenes=[scene_three,scene_four]
for index,scene in enumerate(scenes,3):
    target=OUT/f'solution-{index:02}.mp4'
    encoder=subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','medium','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],stdin=subprocess.PIPE)
    try:
        for frame in range(FPS*SECONDS):
            t=frame/FPS;im,d=base(index,t);scene(d,t)
            if frame==FPS:im.save(POSTERS/f'solution-{index:02}.png')
            encoder.stdin.write(im.tobytes())
    finally:encoder.stdin.close()
    if encoder.wait()!=0:raise RuntimeError(f'Video encoder failed for {target}')
    print(f'{target.name}: {SECONDS}s, {W}x{H}, {target.stat().st_size} bytes',flush=True)
