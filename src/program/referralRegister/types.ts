export type ReferralRegister = {
  version: "0.1.0";
  name: "referral_register";
  instructions: [
    {
      name: "initMainState";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
        },
        {
          name: "mainState";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "mainStateParams";
          type: {
            defined: "MainStateParams";
          };
        }
      ];
    },
    {
      name: "updateMainState";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
        },
        {
          name: "mainState";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "input";
          type: {
            defined: "UpdateMainStateInput";
          };
        }
      ];
    },
    {
      name: "initReferralNode";
      accounts: [
        {
          name: "owner";
          isMut: true;
          isSigner: true;
        },
        {
          name: "referralNode";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "referrer";
          type: {
            option: "publicKey";
          };
        }
      ];
    },
    {
      name: "claim";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "mainState";
          isMut: true;
          isSigner: false;
        },
        {
          name: "referralNode";
          isMut: true;
          isSigner: false;
        },
        {
          name: "referrer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "eventAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "program";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "mainState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            type: "publicKey";
          },
          {
            name: "treasury";
            type: "publicKey";
          },
          {
            name: "layerFeeBps";
            type: "u16";
          }
        ];
      };
    },
    {
      name: "referralNode";
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            type: "publicKey";
          },
          {
            name: "referrer";
            type: {
              option: "publicKey";
            };
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "MainStateParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "treasury";
            type: "publicKey";
          },
          {
            name: "layerFeeBps";
            type: "u16";
          }
        ];
      };
    },
    {
      name: "UpdateMainStateInput";
      type: {
        kind: "struct";
        fields: [
          {
            name: "owner";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "layerFeeBps";
            type: {
              option: "u16";
            };
          }
        ];
      };
    }
  ];
  events: [
    {
      name: "ReferralRewardsClaimed";
      fields: [
        {
          name: "user";
          type: "publicKey";
          index: false;
        },
        {
          name: "referrer";
          type: "publicKey";
          index: false;
        },
        {
          name: "amountOut";
          type: "u64";
          index: false;
        }
      ];
    },
    {
      name: "ReferralNodeCreated";
      fields: [
        {
          name: "owner";
          type: "publicKey";
          index: false;
        },
        {
          name: "referrer";
          type: {
            option: "publicKey";
          };
          index: false;
        }
      ];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "UnAuthorised";
      msg: "Unauthorised";
    },
    {
      code: 6001;
      name: "Overflow";
      msg: "Overflow";
    },
    {
      code: 6002;
      name: "NotEnoughBalance";
      msg: "NotEnoughBalance";
    },
    {
      code: 6003;
      name: "InvalidReferrer";
      msg: "InvalidReferrer";
    }
  ];
};

export const IDL: ReferralRegister = {
  version: "0.1.0",
  name: "referral_register",
  instructions: [
    {
      name: "initMainState",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mainState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "mainStateParams",
          type: {
            defined: "MainStateParams",
          },
        },
      ],
    },
    {
      name: "updateMainState",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mainState",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "input",
          type: {
            defined: "UpdateMainStateInput",
          },
        },
      ],
    },
    {
      name: "initReferralNode",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "referralNode",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "referrer",
          type: {
            option: "publicKey",
          },
        },
      ],
    },
    {
      name: "claim",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mainState",
          isMut: true,
          isSigner: false,
        },
        {
          name: "referralNode",
          isMut: true,
          isSigner: false,
        },
        {
          name: "referrer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "eventAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "program",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "mainState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "treasury",
            type: "publicKey",
          },
          {
            name: "layerFeeBps",
            type: "u16",
          },
        ],
      },
    },
    {
      name: "referralNode",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "referrer",
            type: {
              option: "publicKey",
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "MainStateParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "treasury",
            type: "publicKey",
          },
          {
            name: "layerFeeBps",
            type: "u16",
          },
        ],
      },
    },
    {
      name: "UpdateMainStateInput",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "layerFeeBps",
            type: {
              option: "u16",
            },
          },
        ],
      },
    },
  ],
  events: [
    {
      name: "ReferralRewardsClaimed",
      fields: [
        {
          name: "user",
          type: "publicKey",
          index: false,
        },
        {
          name: "referrer",
          type: "publicKey",
          index: false,
        },
        {
          name: "amountOut",
          type: "u64",
          index: false,
        },
      ],
    },
    {
      name: "ReferralNodeCreated",
      fields: [
        {
          name: "owner",
          type: "publicKey",
          index: false,
        },
        {
          name: "referrer",
          type: {
            option: "publicKey",
          },
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "UnAuthorised",
      msg: "Unauthorised",
    },
    {
      code: 6001,
      name: "Overflow",
      msg: "Overflow",
    },
    {
      code: 6002,
      name: "NotEnoughBalance",
      msg: "NotEnoughBalance",
    },
    {
      code: 6003,
      name: "InvalidReferrer",
      msg: "InvalidReferrer",
    },
  ],
};
