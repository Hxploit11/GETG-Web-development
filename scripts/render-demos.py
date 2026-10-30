"""Render original, silent cartoon concept videos. Development only.

Requires Pillow and imageio-ffmpeg. No supplied or AI image is modified here;
every animation frame is drawn from geometric primitives.
"""
from pathlib import Path
import math
import subprocess
import argparse
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

def scene_one(d,t):
    # Field overview: a complete five-axle tanker enters, then is inspected.
    # The tires are drawn independently from the body, always fully visible.
    for x,y,size in [(160,275,.65),(635,260,.8),(1075,255,.6)]:
        d.polygon([(x-40*size,y+110*size),(x,y),(x+45*size,y+110*size)],fill='#6e9581')
        d.polygon([(x-22*size,y+98*size),(x,y+30*size),(x+24*size,y+98*size)],fill=SKY)
        angle=.13*math.sin(t*2+x)
        left=(x-80*size*math.cos(angle),y-80*size*math.sin(angle))
        right=(x+80*size*math.cos(angle),y+80*size*math.sin(angle))
        d.line([left,right],fill=GREEN,width=12)
        d.line((left[0],left[1],left[0],y+115*size),fill='#4b7867',width=3)
        d.ellipse((x-8,y-8,x+8,y+8),fill=LIME)
    # Low storage tanks and a connecting pipe establish the field setting.
    for x in [335,435]:
        rr(d,(x,273,x+72,360),'#9bb5a6',8,outline='#698f79',width=2)
        d.ellipse((x,263,x+72,286),fill='#c8d8ca',outline='#698f79',width=2)
    d.line((320,361,537,361,537,383),fill=GREEN,width=9)
    d.rectangle((0,527,W,604),fill='#b5c0af')
    for x in range(0,W,100):d.line((x,575,x+45,575),fill='#e9eee2',width=4)

    travel=min(t/2,1)
    travel=travel*travel*(3-2*travel)
    shift=35+100*travel
    def box(bounds,fill,radius=10,outline=None,width=1):
        rr(d,(bounds[0]+shift,bounds[1],bounds[2]+shift,bounds[3]),fill,radius,outline,width)
    def line(points,fill,width):d.line([(x+shift,y) for x,y in points],fill=fill,width=width)
    # Continuous chassis and fifth wheel connection.
    box((62,454,1048,477),INK,5)
    box((681,438,812,455),'#617b6d',5)
    # Silver tank and clearly separated mounting bands.
    box((64,314,735,443),'#8faaa3',60,INK,3)
    box((71,321,727,427),'#cfdfd9',52)
    box((90,333,708,365),'#eff6ee',16)
    line([(92,404),(707,404)],'#9cb8ae',7)
    for x in [190,350,510,665]:line([(x,320),(x,436)],'#9bb0a5',5)
    line([(143,306),(691,306)],INK,4)
    for x in [143,320,500,691]:line([(x,306),(x,315)],INK,3)
    # Tractor cab faces right, matching its direction of travel.
    box((785,303,945,454),GREEN,19,INK,3)
    d.polygon([(922+shift,328),(976+shift,337),(1011+shift,393),(1048+shift,407),(1048+shift,455),(920+shift,455)],fill=GREEN,outline=INK,width=3)
    box((804,321,913,366),'#a5d8d0',7)
    d.polygon([(930+shift,341),(965+shift,347),(988+shift,384),(930+shift,384)],fill='#a5d8d0')
    line([(932,388),(1013,388)],INK,3)
    box((797,386,927,439),'#1b654b',8)
    box((810,389,833,395),LIME,2)
    box((1017,419,1047,446),'#bbd2c5',4)
    box((1038,400,1051,410),'#fff5bd',2)
    box((804,447,926,458),'#b6cec0',3)
    # All five visible wheels retain intact tires, rims and rotating spokes.
    for x in [130,218,739,827,1008]:
        cx=x+shift;cy=491;r=36
        d.ellipse((cx-r-3,cy-r-3,cx+r+3,cy+r+3),fill='#102b27')
        d.ellipse((cx-r,cy-r,cx+r,cy+r),fill='#233934',outline='#53615a',width=3)
        d.ellipse((cx-23,cy-23,cx+23,cy+23),fill='#d2dfd5',outline='#81978d',width=3)
        for i in range(8):
            a=i*math.tau/8+(shift-35)/r
            d.line((cx+9*math.cos(a),cy+9*math.sin(a),cx+20*math.cos(a),cy+20*math.sin(a)),fill='#789689',width=3)
        d.ellipse((cx-7,cy-7,cx+7,cy+7),fill=GREEN)
    # The site inspection highlights a closed connection above the chassis.
    box((556,437,588,458),GREEN,4,INK,2)
    if t>=2:
        person(d,650,540,.62,math.sin(t*2))
        radius=30+3*math.sin(t*4)
        cx=shift+572;cy=446
        d.ellipse((cx-radius,cy-radius,cx+radius,cy+radius),outline=LIME,width=3)
        d.line((cx,cy+radius,650,485),fill='#64866c',width=2)
    if t>=4:badge(d,1140,210,t)

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

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--only',choices=['field-overview','solution-03','solution-04'])
options=parser.parse_args()
scenes=[(1,scene_one,'field-overview'),(3,scene_three,'solution-03'),(4,scene_four,'solution-04')]
for index,scene,name in scenes:
    if options.only and name!=options.only:continue
    target=OUT/f'{name}.mp4'
    encoder=subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','medium','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],stdin=subprocess.PIPE)
    try:
        for frame in range(FPS*SECONDS):
            t=frame/FPS;im,d=base(index,t);scene(d,t)
            if frame==FPS:im.save(POSTERS/f'{name}.png')
            encoder.stdin.write(im.tobytes())
    finally:encoder.stdin.close()
    if encoder.wait()!=0:raise RuntimeError(f'Video encoder failed for {target}')
    print(f'{target.name}: {SECONDS}s, {W}x{H}, {target.stat().st_size} bytes',flush=True)
