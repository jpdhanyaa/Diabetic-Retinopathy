function processRetina(inputPath, outputPath)
% PROCESSRETINA - Diabetic Retinopathy Retinal Image Contrast & Vessel Enhancement
% Converts RGB fundus photography to black & white G-channel with CLAHE equalization.
%
% Usage in MATLAB:
%   processRetina('uploads/retina.jpg', 'results/enhanced.jpg')

% Step 1: Read input retinal fundus photograph
I = imread(inputPath);

% Step 2: Standardize matrix resolution to 600x600 pixels
I = imresize(I, [600 600]);

% Step 3: Extract green channel G = I(:,:,2) for optimal black & white vessel contrast
G = I(:,:,2);

% Step 4: Estimate non-uniform background illumination using Gaussian low-pass filter
background = imgaussfilt(G, 45);

% Step 5: Normalize and divide illumination variations
Gnorm = imdivide(G, background, 'scaled');

% Step 6: Apply Contrast-Limited Adaptive Histogram Equalization (CLAHE)
Gclahe = adapthisteq(Gnorm, ...
    'NumTiles', [8 8], ...
    'ClipLimit', 0.02);

% Step 7: Denoise micro-artifacts using 3x3 2D median filtering
Gdenoise = medfilt2(Gclahe, [3 3]);

% Step 8: Convert to CIE-Lab color space and replace luminance channel L* with Gdenoise
I_lab = rgb2lab(I);
I_lab(:,:,1) = im2double(Gdenoise) * 100;

% Step 9: Reconstruct enhanced image from Lab to RGB
Enhanced = lab2rgb(I_lab);

% Step 10: Write output enhanced retinal image to destination path
imwrite(Enhanced, outputPath);

fprintf('Successfully processed retinal fundus image: %s -> %s\n', inputPath, outputPath);

end
