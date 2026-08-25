% =========================================================================
% RETINASCAN AI - MATLAB RETINAL IMAGE CONTRAST & VESSEL ENHANCEMENT
% =========================================================================
clc;
clear;
close all;

% Select retinal image
[filename, pathname] = uigetfile(...
    {'*.jpg;*.jpeg;*.png;*.tif', 'Image Files'}, ...
    'Select Retinal Image');

% Check if image is selected
if isequal(filename, 0)
    disp('No image selected');
    return;
end

% Create complete image path
imagePath = fullfile(pathname, filename);

% Read retinal image
I = imread(imagePath);

% Resize image
I = imresize(I, [600 600]);

% Check if image is RGB or grayscale
if size(I,3) == 3
    G = I(:,:,2);
else
    G = I;
end

% Convert to double
Gdouble = im2double(G);

% Illumination correction
background = imfilter(Gdouble, ...
    fspecial('gaussian', [51 51], 25), ...
    'replicate');

Gnorm = Gdouble - background;

Gnorm = mat2gray(Gnorm);

% CLAHE enhancement
Gclahe = adapthisteq(Gnorm, ...
    'NumTiles', [8 8], ...
    'ClipLimit', 0.02);

% Noise removal
Gdenoise = medfilt2(Gclahe, [3 3]);

% Final contrast enhancement
Genhanced = imadjust(Gdenoise);

% Display results
figure;

subplot(2,3,1);
imshow(I);
title('Original Image');

subplot(2,3,2);
imshow(G);
title('Green Channel / Grayscale');

subplot(2,3,3);
imshow(Gnorm);
title('Illumination Corrected');

subplot(2,3,4);
imshow(Gclahe);
title('After CLAHE');

subplot(2,3,5);
imshow(Gdenoise);
title('After Denoising');

subplot(2,3,6);
imshow(Genhanced);
title('Final Enhanced Image');

% Save enhanced image
imwrite(Genhanced, 'enhanced_retina.jpg');

disp('Image enhancement completed successfully!');
