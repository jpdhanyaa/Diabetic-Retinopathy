function [Genhanced, Gnorm, Gclahe, Gdenoise] = processRetina(inputPath, outputPath)
% PROCESSRETINA - Diabetic Retinopathy MATLAB Image Processing Pipeline
% Implements Gaussian illumination correction, CLAHE, median denoising, and imadjust.
%
% Algorithm:
%   1. I = imread(inputPath); I = imresize(I, [600 600]);
%   2. G = I(:,:,2); (Green channel extraction for optimal vessel contrast)
%   3. background = imfilter(im2double(G), fspecial('gaussian', [51 51], 25), 'replicate');
%   4. Gnorm = mat2gray(im2double(G) - background); (Illumination correction)
%   5. Gclahe = adapthisteq(Gnorm, 'NumTiles', [8 8], 'ClipLimit', 0.02); (CLAHE)
%   6. Gdenoise = medfilt2(Gclahe, [3 3]); (Denoising)
%   7. Genhanced = imadjust(Gdenoise); (Final contrast enhancement)

% Read and resize retinal fundus image
I = imread(inputPath);
I = imresize(I, [600 600]);

% Extract green channel or grayscale
if size(I, 3) == 3
    G = I(:,:,2);
else
    G = I;
end

% Convert to double precision
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

% If output path provided, save final enhanced image
if nargin >= 2 && ~isempty(outputPath)
    imwrite(Genhanced, outputPath);
    fprintf('Saved final enhanced retinal image to: %s\n', outputPath);
end

end
