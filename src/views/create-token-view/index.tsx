'use client';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import { parseDateTime } from '@internationalized/date';
import { toNano } from '@ton/core';

import { FormField, Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DateTimePicker } from '@/components/ui/date-time-picker/date-time-picker';
import { Credenza, CredenzaContent } from '@/components/ui/credenza';
import { useToast } from '@/components/ui/use-toast';
import { LoadingButton } from '@/components/ui/loading-button';

import UploadImage from './components/upload-image';
import CreateBuyModal from './components/create-buy-modal';

import Protect from '@/packages/password-protect';
import { useSearchParams } from 'next/navigation';
import StealthTrigger from './components/stealth-trigger';
import { Toast } from '@/components/ui/toast';
import { createToken } from '@/lib/data/tokens';
import { TX_VALID_DURATION } from '@/lib/constants';
import useTonAssetsSDK from '@/hooks/useTonAssetsSDK';
import { useTonWallet } from '@tonconnect/ui-react';

export const tokenSchema = z.object({
  name: z.string().max(20).min(1, 'Token name is required'),
  ticker: z.string().max(10).min(1, 'Ticker symbol is required'),
  description: z.string().max(256).optional(),
  website: z.string().url().optional().or(z.string().max(0)),
  telegram: z.string().url().optional().or(z.string().max(0)),
  twitter: z.string().url().optional().or(z.string().max(0)),
  maxBuyPerWallet: z.coerce
    .number()
    .refine((amount) => amount >= 0, 'Max buy amount must be positive')
    .optional(),
  startTime: z
    .number()
    .optional()
    .refine((ts) => {
      if (!ts) return true;
      return ts > moment().unix();
    }, 'Start date must be in the future'),
  buyAmount: z.coerce
    .number()
    .refine((amount) => amount >= 0, 'Buy amount must be positive')
    .optional(),
});

type TokenFormData = z.infer<typeof tokenSchema>;

const placeholders = {
  name: '',
  ticker: '',
  description: '',
  website: '(optional)',
  telegram: '(optional)',
  twitter: '(optional)',
  maxBuyPerWallet: '100000000',
};

const CreateTokenView = () => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [imageError, setImageError] = useState<string>();
  // const [open, setOpen] = useState(false);
  const wallet = useTonWallet();
  const { toast } = useToast();
  const assetsSDK = useTonAssetsSDK();

  const form = useForm<TokenFormData>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      name: '',
      ticker: '',
      description: '',
      website: '',
      telegram: '',
      twitter: '',
      startTime: 0,
      maxBuyPerWallet: 0,
    },
  });

  useEffect(() => {
    setImageError('');
  }, [imageUrl]);

  const onSubmit = async (data: TokenFormData) => {
    if (!imageUrl) {
      setImageError('Please upload an image');
      return;
    }

    if (!wallet || !assetsSDK) {
      toast({
        title: 'Error',
        description: 'Please Connect Wallet',
        variant: 'destructive',
      });
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: 'Error',
        description: 'Failed to validate form',
        variant: 'destructive',
      });
      return;
    }
    console.log('======================================', data);

    try {
      const jetton = await assetsSDK.deployJetton(
        { name: data.name, description: data.description, symbol: data.ticker, image: imageUrl, uri: data.website },
        {
          adminAddress: assetsSDK.sender?.address,
          onchainContent: false,
          premintAmount: toNano((data.maxBuyPerWallet == undefined || data.maxBuyPerWallet == 0 ? 1000000000 : data.maxBuyPerWallet).toString()),
          value: toNano('0.25'),
        }
      );
      console.log(jetton);

      // createToken({address: msg.jettonAddress, name: data.name, symbol: data.ticker, description: data.description, imageUri: imageUrl, socials: })
      // localStorage.setItem("newJettonAddress", msg.jettonAddress);
      // setOpen(true);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to create jetton',
        variant: 'destructive',
      });
    }
  };

  return (
    <StealthTrigger>
      <div className="w-full px-4 pt-12 md:pt-0 md:max-w-md mx-auto">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Token Name <span className="text-[#de7aa1]">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="text" {...field} placeholder={placeholders.name} required={true} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="ticker"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Ticker Symbol <span className="text-[#de7aa1]">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="text" {...field} placeholder={placeholders.ticker} required={true} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description <span className="text-[#de7aa1]">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder={placeholders.description} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pb-3">
                Image <span className="text-[#de7aa1]">*</span>
              </p>
              <UploadImage setUrl={setImageUrl} />
              {imageError && <div className="text-red-500 text-sm">{imageError}</div>}
            </div>

            <FormField
              name="website"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} placeholder={placeholders.website} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col md:flex-row gap-4">
              <FormField
                name="telegram"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Telegram</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder={placeholders.telegram} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="twitter"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Twitter</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} placeholder={placeholders.twitter} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={showAdvancedOptions}
                onCheckedChange={(checked) => {
                  setShowAdvancedOptions(checked);
                  form.setValue('startTime', 0);
                  form.setValue('maxBuyPerWallet', 100_000_000);
                }}
              />
              <label htmlFor="advancedOptions" className="text-sm font-medium">
                Extra Options
              </label>
            </div>
            {showAdvancedOptions && (
              <div className="space-y-4">
                <FormField
                  name="maxBuyPerWallet"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Buy per Wallet</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder={placeholders.maxBuyPerWallet} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time (UTC)</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          aria-label="Start Time"
                          granularity={'minute'}
                          minValue={parseDateTime(new Date().toISOString().substring(0, 16))}
                          errorMessage={form.formState.errors.startTime?.message}
                          onChange={(date) => {
                            const unix = moment(date.toDate('utc')).unix();
                            field.onChange(unix);
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
            <center className="pt-2">
              <LoadingButton className="hover:bg-[#c5688e]" type="submit">
                Create Token
              </LoadingButton>
              <p className="m-2 text-sm text-muted">Cost to deploy: ~0.02 SOL</p>
            </center>
            {/* <Credenza open={open} onOpenChange={(open) => setOpen(open)}>
              <CreateBuyModal
                tokenForm={form.getValues()}
                imageUrl={imageUrl!}
              />
            </Credenza> */}
          </form>
        </Form>
      </div>
    </StealthTrigger>
  );
};

export default CreateTokenView;
