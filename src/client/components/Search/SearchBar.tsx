import { Search } from '@amsterdam/asc-assets';
import styles from './SearchBar.module.scss';
import {
  ChangeEvent,
  CSSProperties,
  FormEvent,
  forwardRef,
  FunctionComponent,
  InputHTMLAttributes,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  createContext,
  KeyboardEvent,
} from 'react';
import { useUID } from 'react-uid';
import { CloseButton, IconButton } from '../Button/Button';

export interface InputMethods extends InputHTMLAttributes<HTMLInputElement> {
  onWatchValue?: (value: string) => void;
  setInputRef?: (ref: RefObject<HTMLInputElement>) => void;
}

export interface InputProps extends InputMethods {
  keepFocus?: boolean;
  blurOnEscape?: boolean;
  error?: boolean;
}

export interface TextFieldProps extends InputProps {
  label?: string;
  keepFocus?: boolean;
  srOnly?: boolean;
  error?: boolean;
  labelStyle?: CSSProperties;
  onClear?: () => void;
  autoFocus?: boolean;
}

export interface SearchBarProps extends TextFieldProps {
  label?: string;
  inputProps?: InputProps;
  onWatchValue?: (value: string) => void;
  onSubmit?: (e: FormEvent) => void;
  autoFocus?: boolean;
  showAt?: string;
  hideAt?: string;
}

enum KeyboardKeys {
  // Extend to your needs
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowRight = 'ArrowRight',
  ArrowLeft = 'ArrowLeft',
  Escape = 'Escape',
  Enter = 'Enter',
  Tab = 'Tab',
  Space = 'Space',
  Home = 'Home',
  End = 'End',
}

const InputContext = createContext({});

function useFocus(ref: RefObject<HTMLElement>, shouldFocus = true) {
  useEffect(() => {
    if (shouldFocus && ref.current) {
      ref.current.focus();
    }
  }, [ref, shouldFocus]);
}

function useActionOnEscape(callback: () => void) {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === KeyboardKeys.Escape) {
      callback();
    }
  };

  return {
    onKeyDown,
  };
}

const SearchBarContainer = ({ children, ...rest }: { children: ReactNode }) => {
  return (
    <div className={styles.SearchBarStyle} {...rest}>
      {children}
    </div>
  );
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ blurOnEscape, value, ...props }, externalRef) => {
    const { onKeyDown } = props;
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(
      externalRef,
      () => inputRef.current as HTMLInputElement
    );

    const { onKeyDown: onKeyDownHook } = useActionOnEscape(() => {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    });

    const handleOnKeyDown = (
      e: KeyboardEvent<HTMLInputElement>,
      context: InputMethods
    ) => {
      if (onKeyDown) {
        onKeyDown(e);
      }
      if (blurOnEscape) {
        onKeyDownHook(e);
      }
      if (context.onKeyDown) {
        context.onKeyDown(e);
      }
    };

    return (
      <InputContext.Consumer>
        {(context: InputMethods) => {
          if (context.setInputRef) {
            context.setInputRef(inputRef);
          }
          return (
            <input
              className={styles.InputStyle}
              ref={inputRef}
              {...props}
              {...context}
              onKeyDown={(e) => {
                handleOnKeyDown(e, context);
              }}
              value={value}
            />
          );
        }}
      </InputContext.Consumer>
    );
  }
);

const TextField = ({
  label,
  srOnly,
  onClear,
  value,
  keepFocus,
  blurOnEscape,
  error,
  labelStyle,
  id: idProp,
  autoFocus,
  ...otherProps
}: TextFieldProps) => {
  const uid = useUID();
  const id = idProp || uid;
  const inputRef = useRef<HTMLInputElement>(null);

  useFocus(inputRef, !!autoFocus);

  return (
    <div className={styles.TextFieldStyle}>
      <label className={styles.FormLabelStyle} htmlFor={id}>
        {label}
      </label>
      <div className={styles.InputWrapper}>
        <Input
          {...{ keepFocus, value, blurOnEscape, error }}
          {...otherProps}
          id={id}
          ref={inputRef}
        />
        {onClear && value && (
          <CloseButton
            iconSize="24"
            className={styles.CloseButton}
            onClick={() => {
              onClear();
            }}
          />
        )}
      </div>
    </div>
  );
};

const SearchBar: FunctionComponent<SearchBarProps> = ({
  children,
  placeholder,
  onSubmit,
  onBlur,
  onChange,
  onFocus,
  onWatchValue,
  value,
  label,
  hideAt,
  showAt,
  onClear,
  inputProps,
  autoFocus,
  ...otherProps
}) => {
  let inputRef: RefObject<HTMLInputElement> | null = null;
  const [inputValue, setInputValue] = useState(value || '');

  const handelOnClear = () => {
    setInputValue('');
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }

    if (onClear) {
      onClear();
    }
  };

  const handleOnSubmit = (e: FormEvent) => {
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.currentTarget.value);

    if (onChange) {
      onChange(e);
    }
  };

  useEffect(() => {
    if (onWatchValue) {
      //@ts-ignore
      onWatchValue(inputValue);
    }
  }, [inputValue, onWatchValue]);

  useEffect(() => {
    if (typeof value !== 'undefined') {
      setInputValue(value);
    }
  }, [value, setInputValue]);

  return (
    <SearchBarContainer {...otherProps}>
      <InputContext.Provider
        value={{
          onBlur,
          onFocus,
          onChange: handleOnChange,
          placeholder,
          setInputRef: (ref: RefObject<HTMLInputElement>) => {
            inputRef = ref;
          },
          ...inputProps,
        }}
      >
        <TextField
          srOnly
          keepFocus
          blurOnEscape
          onClear={handelOnClear}
          aria-label={label}
          id={inputProps?.id}
          value={inputValue}
          autoFocus={autoFocus}
          {...{
            inputProps,
            label,
          }}
        />
      </InputContext.Provider>
      <IconButton
        className={styles.SearchButton}
        onClick={handleOnSubmit}
        aria-label={placeholder || 'Zoek'}
        title={placeholder || 'Zoek'}
        type="submit"
        iconSize="36px"
        iconFill="#fff"
        icon={Search}
      />
      {children}
    </SearchBarContainer>
  );
};

SearchBar.defaultProps = {
  placeholder: 'Search...',
  value: '',
};

export default SearchBar;
