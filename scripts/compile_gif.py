from PIL import Image
import glob
import os

frames = sorted(glob.glob('reports/visual/frames/frame_*.png'))
print(f'Compiling GIF from {len(frames)} frames...')

images = []
for f in frames:
    im = Image.open(f)
    im_small = im.resize((720, 450), Image.Resampling.LANCZOS).convert('P', palette=Image.Palette.ADAPTIVE, colors=128)
    images.append(im_small)

if images:
    out_path = 'reports/visual/07_hero_dynamic_motion.gif'
    images[0].save(
        out_path,
        save_all=True,
        append_images=images[1:],
        duration=120,
        loop=0,
        optimize=True
    )
    print(f'[OK] Successfully generated {out_path}')
else:
    print('Error: No frames found!')
