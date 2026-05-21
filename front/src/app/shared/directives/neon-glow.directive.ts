import {
  Directive, ElementRef, HostListener,
  Input, Renderer2, inject
} from '@angular/core';

export type GlowColor = 'neon' | 'green' | 'purple' | 'orange' | 'danger';

@Directive({
  selector: '[appNeonGlow]',
  standalone: true,
})
export class NeonGlowDirective {
  @Input() appNeonGlow: GlowColor = 'neon';

  private el       = inject(ElementRef);
  private renderer = inject(Renderer2);

  private glowMap: Record<GlowColor, string> = {
    neon:   '0 0 16px rgba(0,245,255,0.5)',
    green:  '0 0 16px rgba(0,255,136,0.5)',
    purple: '0 0 16px rgba(191,95,255,0.5)',
    orange: '0 0 16px rgba(255,107,53,0.5)',
    danger: '0 0 16px rgba(255,59,92,0.5)',
  };

  private borderMap: Record<GlowColor, string> = {
    neon:   'rgba(0,245,255,0.6)',
    green:  'rgba(0,255,136,0.6)',
    purple: 'rgba(191,95,255,0.6)',
    orange: 'rgba(255,107,53,0.6)',
    danger: 'rgba(255,59,92,0.6)',
  };

  @HostListener('mouseenter')
  onEnter(): void {
    this.renderer.setStyle(
      this.el.nativeElement, 'box-shadow', this.glowMap[this.appNeonGlow]
    );
    this.renderer.setStyle(
      this.el.nativeElement, 'border-color', this.borderMap[this.appNeonGlow]
    );
    this.renderer.setStyle(
      this.el.nativeElement, 'transition', 'all 0.2s ease'
    );
  }

  @HostListener('mouseleave')
  onLeave(): void {
    this.renderer.removeStyle(this.el.nativeElement, 'box-shadow');
    this.renderer.setStyle(
      this.el.nativeElement, 'border-color', 'rgba(30,30,46,1)'
    );
  }
}
