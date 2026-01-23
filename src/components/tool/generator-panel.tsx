'use client';

/**
 * Generator Panel Component
 * Tool page generator panel with dark theme design
 */

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  calculateModelCredits,
  getAvailableModels,
} from '@/config/video-credits';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  Image as ImageIcon,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ArtStyleSelector } from './art-style-selector';

// ============================================================================
// Types
// ============================================================================

interface SectionLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

function SectionLabel({ children, required }: SectionLabelProps) {
  return (
    <label className="text-xs text-zinc-400 font-medium uppercase tracking-wide mb-2 block">
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}

interface GeneratorPanelProps {
  toolType: 'image-to-video' | 'text-to-video' | 'reference-to-video';
  isLoading?: boolean;
  onSubmit?: (data: GeneratorData) => void;
}

export interface GeneratorData {
  toolType: string;
  model: string;
  prompt: string;
  duration: number;
  aspectRatio: string;
  quality?: string;
  imageFile?: File;
  estimatedCredits: number;
  artStyle?: string;
}

export function GeneratorPanel({
  toolType,
  isLoading = false,
  onSubmit,
}: GeneratorPanelProps) {
  const t = useTranslations('ToolPage.generator');
  const tTitles = useTranslations('ToolPage.titles');
  const tStyles = useTranslations('ToolPage.artStyles');
  const allModels = getAvailableModels();
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(allModels[0]?.id || '');
  const [duration, setDuration] = useState(10);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [quality, setQuality] = useState('standard');
  const [artStyle, setArtStyle] = useState('default');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter models based on tool type
  const availableModels = useMemo(() => {
    if (toolType === 'image-to-video' || toolType === 'reference-to-video') {
      return allModels.filter((m) => m.supportImageToVideo);
    }
    return allModels;
  }, [toolType, allModels]);

  const currentModel = useMemo(
    () => allModels.find((m) => m.id === selectedModel) || availableModels[0],
    [allModels, selectedModel, availableModels]
  );

  const estimatedCredits = useMemo(() => {
    if (!selectedModel) return 0;
    return calculateModelCredits(selectedModel, {
      duration,
      quality: currentModel?.qualities?.includes(quality) ? quality : undefined,
    });
  }, [selectedModel, duration, quality, currentModel]);

  const handleSubmit = useCallback(() => {
    if (!prompt.trim() || isLoading) return;

    const data: GeneratorData = {
      toolType,
      model: selectedModel,
      prompt: prompt.trim(),
      duration,
      aspectRatio,
      quality: currentModel?.qualities?.includes(quality) ? quality : undefined,
      imageFile: imageFile || undefined,
      estimatedCredits,
      artStyle: artStyle !== 'default' ? artStyle : undefined,
    };

    onSubmit?.(data);
  }, [
    prompt,
    selectedModel,
    duration,
    aspectRatio,
    quality,
    artStyle,
    imageFile,
    estimatedCredits,
    isLoading,
    toolType,
    onSubmit,
    currentModel,
  ]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate submission requirements
  const requiresImage = toolType === 'image-to-video';
  const hasRequiredImage = !requiresImage || imageFile !== null;
  const canSubmit = prompt.trim().length > 0 && !isLoading && hasRequiredImage;

  // Get page title
  const getPageTitle = () => {
    if (toolType === 'image-to-video') return tTitles('imageToVideo');
    if (toolType === 'text-to-video') return tTitles('textToVideo');
    if (toolType === 'reference-to-video') return tTitles('referenceToVideo');
    return tTitles('aiGenerator');
  };

  const showImageUpload =
    toolType === 'image-to-video' || toolType === 'reference-to-video';

  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden">
      {/* Main Card - Dark Theme */}
      <div className="flex-1 flex flex-col rounded-xl bg-[#1A1A1A] border border-zinc-800 overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3 bg-zinc-900/50 border-b border-zinc-800 shrink-0">
          <h2 className="text-sm text-zinc-400 font-medium uppercase tracking-wide">
            {getPageTitle()}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Model Selection */}
          <div>
            <SectionLabel>{t('model')}</SectionLabel>
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={isLoading}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-white font-medium">
                    {currentModel?.name || t('selectModel')}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="bg-[#1A1A1A] border-zinc-800 w-[300px] max-h-[320px] overflow-y-auto"
              >
                <DropdownMenuLabel className="text-zinc-400 text-xs uppercase tracking-wide">
                  {t('videoModels')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                {availableModels.map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className="text-white hover:bg-zinc-800 py-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            selectedModel === model.id
                              ? 'bg-purple-500'
                              : 'bg-zinc-600'
                          )}
                        />
                        <span className="font-medium">{model.name}</span>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1 ml-5">
                      {model.provider} •{' '}
                      {model.supportImageToVideo
                        ? t('highQuality')
                        : t('standard')}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Image Upload (for image-to-video and reference-to-video) */}
          {showImageUpload && currentModel?.supportImageToVideo && (
            <div>
              <SectionLabel required={toolType === 'image-to-video'}>
                {toolType === 'reference-to-video'
                  ? t('referenceVideo')
                  : t('imageSource')}
              </SectionLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
              />
              {imagePreview ? (
                <div className="relative group aspect-video rounded-lg overflow-hidden border-2 border-zinc-700">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-700 hover:bg-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-zinc-700 hover:border-purple-500/50 cursor-pointer transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                    <ImageIcon className="w-6 h-6 text-zinc-500 group-hover:text-purple-400" />
                  </div>
                  <p className="text-sm text-zinc-400 mt-3">
                    {t('uploadImage')}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {t('uploadHint')}
                  </p>
                </button>
              )}
            </div>
          )}

          {/* Art Style Selection */}
          <div>
            <SectionLabel>{tStyles('label')}</SectionLabel>
            <ArtStyleSelector
              value={artStyle}
              onChange={setArtStyle}
              disabled={isLoading}
            />
          </div>

          {/* Prompt Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>{t('prompt')}</SectionLabel>
              <button className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-400 transition-colors">
                <Wand2 className="w-3 h-3" />
                <span>{t('enhance')}</span>
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('promptPlaceholder')}
              disabled={isLoading}
              className="w-full min-h-[100px] max-h-[200px] px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-purple-500 transition-colors text-sm leading-relaxed"
              rows={4}
              maxLength={2000}
            />
          </div>

          {/* Settings Group */}
          <div className="space-y-5">
            {/* Aspect Ratio */}
            {currentModel?.aspectRatios && (
              <div>
                <SectionLabel>{t('aspectRatio')}</SectionLabel>
                <div className="flex gap-3">
                  {currentModel.aspectRatios.map((ar) => (
                    <button
                      key={ar}
                      type="button"
                      onClick={() => setAspectRatio(ar)}
                      disabled={isLoading}
                      className={cn(
                        'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                        aspectRatio === ar
                          ? 'bg-purple-600/20 text-purple-400 border-2 border-purple-500'
                          : 'bg-zinc-900 text-zinc-400 border-2 border-zinc-800 hover:border-zinc-700'
                      )}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={cn(
                            'border-2 rounded-sm',
                            aspectRatio === ar
                              ? 'border-purple-400'
                              : 'border-zinc-600',
                            ar === '16:9' && 'w-8 h-4',
                            ar === '9:16' && 'w-4 h-8',
                            ar === '1:1' && 'w-6 h-6',
                            ar === '4:3' && 'w-6 h-4',
                            ar === '3:4' && 'w-4 h-6'
                          )}
                        />
                        <span>{ar}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration & Quality */}
            <div className="grid grid-cols-2 gap-3">
              {currentModel?.durations && (
                <div>
                  <SectionLabel>{t('videoLength')}</SectionLabel>
                  <div className="flex gap-2">
                    {currentModel.durations.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        disabled={isLoading}
                        className={cn(
                          'flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                          duration === d
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                        )}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentModel?.qualities && (
                <div>
                  <SectionLabel>{t('resolution')}</SectionLabel>
                  <div className="flex gap-2">
                    {currentModel.qualities.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuality(q)}
                        disabled={isLoading}
                        className={cn(
                          'flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all capitalize',
                          quality === q
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                        )}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section - Credits + Generate Button */}
        <div className="px-5 py-4 bg-zinc-900/50 border-t border-zinc-800 space-y-4 shrink-0">
          {/* Credits Display */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
              {t('totalCredits')}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
              <span className="text-white font-medium">
                {t('credits', { count: estimatedCredits })}
              </span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
              canSubmit
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('generating')}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t('generateVideo')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
