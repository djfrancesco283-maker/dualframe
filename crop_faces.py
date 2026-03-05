from PIL import Image
img = Image.open('assets/img/team_page.jpg')
img.crop((1140, 330, 1640, 820)).save('assets/img/yvan.jpg')
img.crop((2380, 330, 2880, 820)).save('assets/img/francesco.jpg')
print('ok')
