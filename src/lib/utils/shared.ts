import millify from "millify";
import { UserDto } from "../data/dtos";
import { parseIpfsUrl } from "./ipfs";
import { minidenticon } from "minidenticons";

export function safeValue<T>(value: T | null): T | undefined;
export function safeValue<T>(value: T | null, defaultValue: T): T;
export function safeValue<T>(value: T | null, defaultValue?: T): T | undefined {
  return value !== null ? value : defaultValue;
}

export const toMil = (value: number | string, precision = 2): string => {
  if (typeof value === "string") {
    value = parseFloat(value);
  }

  return millify(value, {
    precision,
  });
};

export const toReadableDecimal = (num: number) => {
  try {
    // Convert the number to a string in exponential form
    const exponentialForm = num.toExponential();

    // Extract the parts of the exponential form
    const [coefficient, exponent] = exponentialForm.split("e");
    let decimalPart = coefficient.split(".").reduce((acc, part) => acc + part);

    // Calculate the number of leading zeros
    const leadingZeros = Math.abs(parseInt(exponent)) - 1;

    if (leadingZeros < 1) {
      return num;
    }

    // Create the subscript notation
    const subscriptNotation = leadingZeros
      .toString()
      .split("")
      .map((digit) => String.fromCharCode(8320 + parseInt(digit)))
      .join("");

    // slice decimal part
    decimalPart = decimalPart.slice(0, 4);

    // Combine the parts into the desired format
    return `0.0${subscriptNotation}${decimalPart}`;
  } catch (e) {
    return num;
  }
};

export const getRealtimeValue = <P>(staticValue: P, storeValue: P): P => {
  return storeValue ?? staticValue;
};

export const getUserPfp = (user?: UserDto) => {
  const svgURI =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(minidenticon(user?.wallet ?? "DEFAULT"));

  if (!user) return svgURI;

  return user.pfpUrl ? parseIpfsUrl(user.pfpUrl) : svgURI;
};

// call if param is not undefined
export const safeCall = <T, R>(
  fn: (param: T) => R,
  param: T | undefined | null
): R | undefined => (param && param !== null ? fn(param) : undefined);
