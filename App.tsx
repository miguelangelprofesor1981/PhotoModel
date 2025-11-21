
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { GeneratedImageCard } from './components/GeneratedImageCard';
import { EditingPanel } from './components/EditingPanel';
import { Loader } from './components/Loader';
import { Header } from './components/Header';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import type { GeneratedImage, AspectRatio } from './types';
import { analyzeGarment, generateModelImages, describeGeneratedImage, editImage } from './services/geminiService';

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loadingState, setLoadingState] = useState<{ active: boolean; message: string }>({ active: false, message: '' });
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');

  const handleImageUpload = useCallback(async (file: File) => {
    setError(null);
    setGeneratedImages([]);
    setSelectedImageIndex(null);
    
    // Basic validation
    if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      const base64Image = result.split(',')[1];
      setUploadedImage(result);
      
      try {
        setLoadingState({ active: true, message: 'Analyzing your garment...' });
        const analysis = await analyzeGarment(base64Image, file.type);

        setLoadingState({ active: true, message: 'Generating model images (this may take a moment)...' });
        const imagePrompts = [
            `A full-body shot of a photorealistic AI model in a relaxed standing pose, wearing the described garment: ${analysis}. The background is a minimalist studio setting.`,
            `A dynamic full-body shot of a photorealistic AI model walking confidently down a chic city street, wearing the described garment: ${analysis}.`,
            `A high-fashion full-body shot of a photorealistic AI model in a striking pose, wearing the described garment: ${analysis}. The setting is an elegant, softly lit interior.`
        ];
        
        const generatedImageBlobs = await generateModelImages(imagePrompts, aspectRatio);

        if (generatedImageBlobs.length === 0) {
            throw new Error("Failed to generate any images. Please try again.");
        }

        setLoadingState({ active: true, message: 'Crafting style recommendations...' });
        
        const describedImages = await Promise.all(generatedImageBlobs.map(async (blob, index) => {
          const descriptionData = await describeGeneratedImage(blob);
          const pose = index === 0 ? 'Relaxed' : index === 1 ? 'Walking' : 'Pose';
          return {
            src: `data:image/jpeg;base64,${blob}`,
            description: descriptionData.description,
            recommendations: descriptionData.recommendations,
            pose: pose
          } as GeneratedImage;
        }));
        
        setGeneratedImages(describedImages);
        
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
        // Reset uploaded image on critical failure so user can try again easily
        if (!generatedImages.length) {
            setUploadedImage(null);
        }
      } finally {
        setLoadingState({ active: false, message: '' });
      }
    };
    reader.readAsDataURL(file);
  }, [aspectRatio]);

  const handleEdit = useCallback(async (prompt: string) => {
    if (selectedImageIndex === null || !generatedImages[selectedImageIndex]) return;

    setError(null);
    setLoadingState({ active: true, message: 'Applying your edits...' });
    
    try {
      const originalImageBase64 = generatedImages[selectedImageIndex].src.split(',')[1];
      const editedImageBase64 = await editImage(originalImageBase64, prompt);
      
      const updatedImages = [...generatedImages];
      updatedImages[selectedImageIndex] = {
          ...updatedImages[selectedImageIndex],
          src: `data:image/jpeg;base64,${editedImageBase64}`
      };
      setGeneratedImages(updatedImages);
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while editing the image.');
    } finally {
      setLoadingState({ active: false, message: '' });
    }
  }, [selectedImageIndex, generatedImages]);

  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(index === selectedImageIndex ? null : index);
  }

  const reset = () => {
    setUploadedImage(null);
    setGeneratedImages([]);
    setSelectedImageIndex(null);
    setError(null);
    setLoadingState({ active: false, message: '' });
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header onReset={reset} />
      <main className="container mx-auto p-4 md:p-8">
        {loadingState.active && <Loader message={loadingState.message} />}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {!loadingState.active && !uploadedImage && (
          <div>
            <AspectRatioSelector selected={aspectRatio} onSelect={setAspectRatio} />
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
        )}

        {generatedImages.length > 0 && !loadingState.active && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 font-serif">Your AI-Powered Photoshoot</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {generatedImages.map((image, index) => (
                <GeneratedImageCard
                  key={index}
                  image={image}
                  isSelected={selectedImageIndex === index}
                  onSelect={() => handleSelectImage(index)}
                />
              ))}
            </div>

            {selectedImageIndex !== null && (
               <EditingPanel onSubmit={handleEdit} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
