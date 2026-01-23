#!/bin/bash

# =============================================================================
# Media Optimization Script for GenX Landing Page
# =============================================================================
# This script optimizes video and image assets for web performance.
# Requirements: ffmpeg, cwebp (libwebp), ImageMagick (optional)
#
# Usage:
#   ./scripts/optimize-media.sh [command] [options]
#
# Commands:
#   video       Optimize video files
#   image       Optimize image files
#   poster      Generate video poster images
#   all         Run all optimizations
#
# =============================================================================

set -e

# Configuration
INPUT_DIR="${INPUT_DIR:-./raw-media}"
OUTPUT_DIR="${OUTPUT_DIR:-./public}"
VIDEO_DIR="$OUTPUT_DIR/videos/demo"
IMAGE_DIR="$OUTPUT_DIR/images/demo"

# Video settings for web optimization
VIDEO_CRF=30                    # Quality (lower = better, 23-35 recommended)
VIDEO_BITRATE="2M"              # Max bitrate
VIDEO_FPS=24                    # Frame rate
VIDEO_WIDTH=1920                # Max width (height auto-calculated)
VIDEO_DURATION=5                # Max duration in seconds

# Image settings
IMAGE_QUALITY=80                # WebP quality (0-100)
POSTER_QUALITY=85               # Poster image quality

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    local missing=()
    
    if ! command -v ffmpeg &> /dev/null; then
        missing+=("ffmpeg")
    fi
    
    if ! command -v cwebp &> /dev/null; then
        missing+=("cwebp (libwebp)")
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing dependencies: ${missing[*]}"
        echo ""
        echo "Install on macOS:"
        echo "  brew install ffmpeg webp"
        echo ""
        echo "Install on Ubuntu/Debian:"
        echo "  sudo apt-get install ffmpeg webp"
        exit 1
    fi
    
    log_success "All dependencies found"
}

ensure_directories() {
    mkdir -p "$VIDEO_DIR"
    mkdir -p "$VIDEO_DIR/gallery"
    mkdir -p "$IMAGE_DIR"
    mkdir -p "$IMAGE_DIR/gallery"
    mkdir -p "$IMAGE_DIR/avatars"
}

get_file_size() {
    local file="$1"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        stat -f%z "$file"
    else
        stat -c%s "$file"
    fi
}

format_size() {
    local bytes=$1
    if [ $bytes -gt 1048576 ]; then
        echo "$(echo "scale=2; $bytes / 1048576" | bc)MB"
    elif [ $bytes -gt 1024 ]; then
        echo "$(echo "scale=2; $bytes / 1024" | bc)KB"
    else
        echo "${bytes}B"
    fi
}

# =============================================================================
# Video Optimization
# =============================================================================

optimize_video() {
    local input="$1"
    local output_base="$2"
    local filename=$(basename "$input" | sed 's/\.[^.]*$//')
    
    log_info "Optimizing video: $filename"
    
    local input_size=$(get_file_size "$input")
    log_info "  Input size: $(format_size $input_size)"
    
    # Generate WebM (VP9) - Best compression for modern browsers
    log_info "  Creating WebM (VP9)..."
    ffmpeg -i "$input" \
        -c:v libvpx-vp9 \
        -crf $VIDEO_CRF \
        -b:v $VIDEO_BITRATE \
        -vf "scale='min($VIDEO_WIDTH,iw)':-2,fps=$VIDEO_FPS" \
        -t $VIDEO_DURATION \
        -an \
        -y \
        "${output_base}/${filename}.webm" 2>/dev/null
    
    local webm_size=$(get_file_size "${output_base}/${filename}.webm")
    log_success "  WebM created: $(format_size $webm_size)"
    
    # Generate MP4 (H.264) - Fallback for Safari and older browsers
    log_info "  Creating MP4 (H.264)..."
    ffmpeg -i "$input" \
        -c:v libx264 \
        -crf 23 \
        -preset slow \
        -vf "scale='min($VIDEO_WIDTH,iw)':-2,fps=$VIDEO_FPS" \
        -t $VIDEO_DURATION \
        -an \
        -movflags +faststart \
        -y \
        "${output_base}/${filename}.mp4" 2>/dev/null
    
    local mp4_size=$(get_file_size "${output_base}/${filename}.mp4")
    log_success "  MP4 created: $(format_size $mp4_size)"
    
    # Calculate compression ratio
    local best_size=$webm_size
    [ $mp4_size -lt $best_size ] && best_size=$mp4_size
    local ratio=$(echo "scale=1; (1 - $best_size / $input_size) * 100" | bc)
    log_success "  Compression: ${ratio}% size reduction"
    
    echo ""
}

optimize_all_videos() {
    log_info "=== Video Optimization ==="
    ensure_directories
    
    if [ ! -d "$INPUT_DIR/videos" ]; then
        log_warning "No input videos found at $INPUT_DIR/videos"
        log_info "Place your source videos in $INPUT_DIR/videos/"
        return
    fi
    
    for video in "$INPUT_DIR/videos"/*.{mp4,mov,avi,mkv} 2>/dev/null; do
        [ -f "$video" ] || continue
        optimize_video "$video" "$VIDEO_DIR"
    done
    
    log_success "Video optimization complete!"
}

# =============================================================================
# Poster Generation
# =============================================================================

generate_poster() {
    local input="$1"
    local output_dir="$2"
    local filename=$(basename "$input" | sed 's/\.[^.]*$//')
    
    log_info "Generating poster for: $filename"
    
    # Extract frame at 1 second (or first frame if video is shorter)
    ffmpeg -i "$input" \
        -ss 00:00:01 \
        -vframes 1 \
        -q:v 2 \
        -y \
        "${output_dir}/${filename}-poster.jpg" 2>/dev/null
    
    # Convert to WebP
    cwebp -q $POSTER_QUALITY \
        "${output_dir}/${filename}-poster.jpg" \
        -o "${output_dir}/${filename}-poster.webp" 2>/dev/null
    
    local jpg_size=$(get_file_size "${output_dir}/${filename}-poster.jpg")
    local webp_size=$(get_file_size "${output_dir}/${filename}-poster.webp")
    
    log_success "  JPG: $(format_size $jpg_size), WebP: $(format_size $webp_size)"
}

generate_all_posters() {
    log_info "=== Poster Generation ==="
    ensure_directories
    
    for video in "$VIDEO_DIR"/*.{mp4,webm} 2>/dev/null; do
        [ -f "$video" ] || continue
        # Only process MP4 files to avoid duplicates
        [[ "$video" == *.mp4 ]] || continue
        generate_poster "$video" "$IMAGE_DIR"
    done
    
    log_success "Poster generation complete!"
}

# =============================================================================
# Image Optimization
# =============================================================================

optimize_image() {
    local input="$1"
    local output_dir="$2"
    local filename=$(basename "$input" | sed 's/\.[^.]*$//')
    local extension="${input##*.}"
    
    log_info "Optimizing image: $filename.$extension"
    
    local input_size=$(get_file_size "$input")
    
    # Copy original (as JPG if not already)
    if [[ "$extension" != "jpg" && "$extension" != "jpeg" ]]; then
        ffmpeg -i "$input" -y "${output_dir}/${filename}.jpg" 2>/dev/null
    else
        cp "$input" "${output_dir}/${filename}.jpg"
    fi
    
    # Convert to WebP
    cwebp -q $IMAGE_QUALITY "$input" -o "${output_dir}/${filename}.webp" 2>/dev/null
    
    local jpg_size=$(get_file_size "${output_dir}/${filename}.jpg")
    local webp_size=$(get_file_size "${output_dir}/${filename}.webp")
    
    log_success "  Original: $(format_size $input_size)"
    log_success "  JPG: $(format_size $jpg_size), WebP: $(format_size $webp_size)"
    
    echo ""
}

optimize_all_images() {
    log_info "=== Image Optimization ==="
    ensure_directories
    
    if [ ! -d "$INPUT_DIR/images" ]; then
        log_warning "No input images found at $INPUT_DIR/images"
        log_info "Place your source images in $INPUT_DIR/images/"
        return
    fi
    
    for image in "$INPUT_DIR/images"/*.{jpg,jpeg,png,webp} 2>/dev/null; do
        [ -f "$image" ] || continue
        optimize_image "$image" "$IMAGE_DIR"
    done
    
    log_success "Image optimization complete!"
}

# =============================================================================
# Main
# =============================================================================

show_help() {
    echo "Media Optimization Script for GenX Landing Page"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  video     Optimize video files (creates WebM + MP4)"
    echo "  poster    Generate poster images from videos"
    echo "  image     Optimize image files (creates WebP + JPG)"
    echo "  all       Run all optimizations"
    echo "  help      Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  INPUT_DIR     Source media directory (default: ./raw-media)"
    echo "  OUTPUT_DIR    Output directory (default: ./public)"
    echo ""
    echo "Directory Structure:"
    echo "  raw-media/"
    echo "    ├── videos/       # Source video files"
    echo "    └── images/       # Source image files"
    echo ""
    echo "Example:"
    echo "  INPUT_DIR=./assets OUTPUT_DIR=./public $0 all"
}

main() {
    local command="${1:-help}"
    
    case "$command" in
        video)
            check_dependencies
            optimize_all_videos
            ;;
        poster)
            check_dependencies
            generate_all_posters
            ;;
        image)
            check_dependencies
            optimize_all_images
            ;;
        all)
            check_dependencies
            optimize_all_videos
            generate_all_posters
            optimize_all_images
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
