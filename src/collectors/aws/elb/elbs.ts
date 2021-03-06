import * as AWS from 'aws-sdk';
import { BaseCollector } from "../../base";
import { LogUtil } from '../../../utils/log';

export class ElbV2sCollector extends BaseCollector {
    collect() {
        return this.getAllElbs();
    }

    private async getAllElbs() {

        const self = this;

        const serviceName = 'ELBv2';
        const elbRegions = self.getRegions(serviceName);
        const elbs = {};

        for (let region of elbRegions) {
            try {
                let elb = self.getClient(serviceName, region) as AWS.ELBv2;
                elbs[region] = [];
                let fetchPending = true;
                let marker: string | undefined = undefined;
                while (fetchPending) {
                    const elbsResponse: AWS.ELBv2.DescribeLoadBalancersOutput = await elb.describeLoadBalancers({ Marker: marker }).promise();
                    elbs[region] = elbs[region].concat(elbsResponse.LoadBalancers);
                    marker = elbsResponse.NextMarker;
                    fetchPending = marker !== undefined;
                }
            } catch (error) {
                LogUtil.error(error);
                continue;
            }
        }
        return { elbs };
    }
}