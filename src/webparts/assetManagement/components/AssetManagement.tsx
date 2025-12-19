import * as React from 'react';
import type { IAssetManagementProps } from './IAssetManagementProps';
import App from './App';

export default class AssetManagement extends React.Component<IAssetManagementProps, {}> {
  public render(): React.ReactElement<IAssetManagementProps> {


    return (
      <div><App /></div>
    );
  }
}
