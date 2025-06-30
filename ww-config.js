export default {
  editor: {
    label: {
      en: 'Drawer',
      fr: 'Tiroir'
    },
    icon: 'fontawesome/solid/window-restore',
    bubble: {
      icon: 'fontawesome/solid/window-restore'
    },
    customStylePropertiesOrder: [
      'maxWidth',
      'maxHeight',
      'borderRadius',
      'shadow',
      'backdrop'
    ],
    customSettingsPropertiesOrder: [
      'isOpen',
      'side',
      'size',
      'showOverlay',
      'closeOnOverlayClick',
      'closeOnEsc',
      'preventScroll',
      'title',
      'description',
      'showCloseButton'
    ]
  },
  triggerEvents: [
    {
      name: 'open',
      label: { en: 'On open', fr: 'À l\'ouverture' },
      event: {}
    },
    {
      name: 'close',
      label: { en: 'On close', fr: 'À la fermeture' },
      event: {}
    },
    {
      name: 'overlay-click',
      label: { en: 'On overlay click', fr: 'Clic sur l\'arrière-plan' },
      event: {}
    }
  ],
  properties: {
    isOpen: {
      label: { en: 'Is open', fr: 'Est ouvert' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: false,
      bindable: true
    },
    side: {
      label: { en: 'Side', fr: 'Côté' },
      type: 'TextSelect',
      section: 'settings',
      options: {
        options: [
          { value: 'top', label: { en: 'Top', fr: 'Haut' } },
          { value: 'bottom', label: { en: 'Bottom', fr: 'Bas' } },
          { value: 'left', label: { en: 'Left', fr: 'Gauche' } },
          { value: 'right', label: { en: 'Right', fr: 'Droite' } }
        ]
      },
      defaultValue: 'right',
      bindable: true
    },
    size: {
      label: { en: 'Size', fr: 'Taille' },
      type: 'TextSelect',
      section: 'settings',
      options: {
        options: [
          { value: 'sm', label: { en: 'Small', fr: 'Petit' } },
          { value: 'default', label: { en: 'Default', fr: 'Défaut' } },
          { value: 'lg', label: { en: 'Large', fr: 'Grand' } },
          { value: 'xl', label: { en: 'Extra Large', fr: 'Très grand' } },
          { value: 'full', label: { en: 'Full', fr: 'Plein' } }
        ]
      },
      defaultValue: 'default',
      bindable: true
    },
    showOverlay: {
      label: { en: 'Show overlay', fr: 'Afficher l\'arrière-plan' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true
    },
    closeOnOverlayClick: {
      label: { en: 'Close on overlay click', fr: 'Fermer au clic sur l\'arrière-plan' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true
    },
    closeOnEsc: {
      label: { en: 'Close on Escape key', fr: 'Fermer avec Échap' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true
    },
    preventScroll: {
      label: { en: 'Prevent scroll', fr: 'Empêcher le défilement' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true
    },
    title: {
      label: { en: 'Title', fr: 'Titre' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      multiLang: true
    },
    description: {
      label: { en: 'Description', fr: 'Description' },
      type: 'LongText',
      section: 'settings',
      bindable: true,
      multiLang: true
    },
    showCloseButton: {
      label: { en: 'Show close button', fr: 'Afficher le bouton fermer' },
      type: 'OnOff',
      section: 'settings',
      defaultValue: true,
      bindable: true
    },
    maxWidth: {
      label: { en: 'Max width', fr: 'Largeur max' },
      type: 'Length',
      section: 'style',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 100, max: 1000 },
          { value: '%', label: '%', min: 10, max: 100 },
          { value: 'vw', label: 'vw', min: 10, max: 100 }
        ]
      },
      bindable: true
    },
    maxHeight: {
      label: { en: 'Max height', fr: 'Hauteur max' },
      type: 'Length',
      section: 'style',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 100, max: 1000 },
          { value: '%', label: '%', min: 10, max: 100 },
          { value: 'vh', label: 'vh', min: 10, max: 100 }
        ]
      },
      bindable: true
    },
    customClass: {
      label: { en: 'Custom CSS class', fr: 'Classe CSS personnalisée' },
      type: 'Text',
      section: 'style',
      bindable: true
    }
  }
}; 